"""
Automated Retraining Pipeline for Random Forest Model
This script fetches updated data from MongoDB (including predictions),
retrains the Random Forest model, and logs the results.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import pickle
import json
import os
from datetime import datetime
from pymongo import MongoClient

# Configuration
MODEL_PATH = 'best_crop_yield_model_Random_Forest.pkl'
ENCODERS_PATH = 'label_encoders.pkl'
RETRAINING_LOG_PATH = 'retraining_log.json'
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://cropuser:A9uDNbrVVGn5fazV@cropyieldcluster.kfawiyz.mongodb.net/?retryWrites=true&w=majority&appName=CropYieldCluster')
DB_NAME = 'crop_yield_db'

def fetch_data_from_mongodb():
    """Fetch data from MongoDB including both original data and predictions"""
    try:
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        
        # Fetch original crop data
        crops_collection = db['crops']
        crops_data = list(crops_collection.find({}, {'_id': 0}))
        
        # Fetch prediction data
        predictions_collection = db['predictions']
        predictions_data = list(predictions_collection.find({}, {'_id': 0, 'prediction_id': 0}))
        
        print(f"✅ Fetched {len(crops_data)} records from crops collection")
        print(f"✅ Fetched {len(predictions_data)} records from predictions collection")
        
        # Combine datasets
        if crops_data:
            crops_df = pd.DataFrame(crops_data)
        else:
            crops_df = pd.DataFrame()
            
        if predictions_data:
            # For predictions, we'll use the input data and predicted yield as actual yield
            pred_df = pd.DataFrame(predictions_data)
            # Rename predicted_yield to Yield for training
            if 'predicted_yield' in pred_df.columns:
                pred_df['Yield'] = pred_df['predicted_yield']
                pred_df = pred_df.drop(['predicted_yield', 'estimated_production', 'model_version', 
                                       'prediction_date', 'createdAt', 'updatedAt'], axis=1, errors='ignore')
        else:
            pred_df = pd.DataFrame()
        
        # Combine dataframes
        if not crops_df.empty and not pred_df.empty:
            combined_df = pd.concat([crops_df, pred_df], ignore_index=True)
        elif not crops_df.empty:
            combined_df = crops_df
        elif not pred_df.empty:
            combined_df = pred_df
        else:
            return None, "No data found in database"
        
        client.close()
        return combined_df, None
        
    except Exception as e:
        return None, f"Error fetching from MongoDB: {str(e)}"

def fetch_data_from_csv():
    """Fallback: Fetch data from CSV files"""
    try:
        if os.path.exists('../crop_yield_cleaned.csv'):
            df = pd.read_csv('../crop_yield_cleaned.csv')
            print(f"✅ Loaded {len(df)} records from cleaned CSV")
            return df, None
        elif os.path.exists('../crop_yield.csv'):
            df = pd.read_csv('../crop_yield.csv')
            print(f"✅ Loaded {len(df)} records from original CSV")
            return df, None
        else:
            return None, "No CSV files found"
    except Exception as e:
        return None, f"Error loading CSV: {str(e)}"

def clean_and_prepare_data(df):
    """Clean and prepare data for training"""
    try:
        # Remove missing values
        original_size = len(df)
        df = df.dropna()
        
        # Remove invalid yields
        df = df[df['Yield'] > 0]
        
        # Remove duplicates
        df = df.drop_duplicates()
        
        cleaned_size = len(df)
        print(f"✅ Data cleaned: {original_size} → {cleaned_size} records")
        
        return df, None
    except Exception as e:
        return None, f"Error cleaning data: {str(e)}"

def encode_features(df):
    """Encode categorical features"""
    try:
        label_encoders = {}
        categorical_columns = ['Crop', 'Season', 'State']
        
        for col in categorical_columns:
            le = LabelEncoder()
            df[col + '_encoded'] = le.fit_transform(df[col])
            label_encoders[col] = le
        
        print(f"✅ Encoded categorical features")
        return df, label_encoders, None
        
    except Exception as e:
        return None, None, f"Error encoding features: {str(e)}"

def train_random_forest_model(X_train, X_test, y_train, y_test):
    """Train Random Forest model with optimal hyperparameters"""
    try:
        start_time = datetime.now()
        
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=20,
            min_samples_split=10,
            min_samples_leaf=4,
            random_state=42,
            n_jobs=-1,
            verbose=1
        )
        
        print("🔄 Training Random Forest model...")
        model.fit(X_train, y_train)
        
        training_duration = (datetime.now() - start_time).total_seconds()
        
        # Calculate metrics
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        
        train_mse = mean_squared_error(y_train, y_train_pred)
        test_mse = mean_squared_error(y_test, y_test_pred)
        
        train_rmse = np.sqrt(train_mse)
        test_rmse = np.sqrt(test_mse)
        
        train_r2 = r2_score(y_train, y_train_pred)
        test_r2 = r2_score(y_test, y_test_pred)
        
        metrics = {
            'mse': float(test_mse),
            'rmse': float(test_rmse),
            'r2_score': float(test_r2),
            'train_score': float(train_r2),
            'test_score': float(test_r2),
            'training_duration_seconds': training_duration
        }
        
        print(f"\n✅ Model Training Complete!")
        print(f"   Training Duration: {training_duration:.2f}s")
        print(f"   Train RMSE: {train_rmse:.4f} | Test RMSE: {test_rmse:.4f}")
        print(f"   Train R²: {train_r2:.4f} | Test R²: {test_r2:.4f}")
        
        return model, metrics, None
        
    except Exception as e:
        return None, None, f"Error training model: {str(e)}"

def save_model_and_logs(model, label_encoders, metrics, dataset_size):
    """Save the trained model and log the retraining details"""
    try:
        # Save model using pickle
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(model, f)
        print(f"✅ Model saved to {MODEL_PATH}")
        
        # Save encoders
        with open(ENCODERS_PATH, 'wb') as f:
            pickle.dump(label_encoders, f)
        print(f"✅ Encoders saved to {ENCODERS_PATH}")
        
        # Create log entry
        log_entry = {
            'retrain_date': datetime.now().isoformat(),
            'model_version': 'Random_Forest_v1.0',
            'dataset_size': dataset_size,
            'metrics': metrics,
            'training_duration_seconds': metrics['training_duration_seconds'],
            'data_summary': {
                'total_records': dataset_size,
                'timestamp': datetime.now().isoformat()
            },
            'status': 'success',
            'notes': 'Automated retraining pipeline executed successfully'
        }
        
        # Load existing logs
        logs = []
        if os.path.exists(RETRAINING_LOG_PATH):
            with open(RETRAINING_LOG_PATH, 'r') as f:
                logs = json.load(f)
        
        # Append new log
        logs.append(log_entry)
        
        # Save logs
        with open(RETRAINING_LOG_PATH, 'w') as f:
            json.dump(logs, f, indent=2)
        
        print(f"✅ Retraining log updated ({len(logs)} total entries)")
        
        return True, None
        
    except Exception as e:
        return False, f"Error saving model/logs: {str(e)}"

def retrain_pipeline():
    """Main retraining pipeline"""
    print("\n" + "="*60)
    print("🔄 AUTOMATED RETRAINING PIPELINE - RANDOM FOREST")
    print("="*60 + "\n")
    
    # Step 1: Fetch data
    print("Step 1: Fetching data...")
    df, error = fetch_data_from_mongodb()
    
    if error or df is None:
        print(f"⚠️ MongoDB fetch failed: {error}")
        print("📂 Falling back to CSV files...")
        df, error = fetch_data_from_csv()
        
        if error or df is None:
            print(f"❌ Failed to fetch data: {error}")
            return False
    
    # Step 2: Clean data
    print("\nStep 2: Cleaning and preparing data...")
    df, error = clean_and_prepare_data(df)
    if error:
        print(f"❌ {error}")
        return False
    
    # Step 3: Encode features
    print("\nStep 3: Encoding categorical features...")
    df, label_encoders, error = encode_features(df)
    if error:
        print(f"❌ {error}")
        return False
    
    # Step 4: Prepare features and target
    print("\nStep 4: Preparing features and target...")
    X = df[['Crop_encoded', 'Season_encoded', 'State_encoded', 'Area', 
            'Annual_Rainfall', 'Fertilizer', 'Pesticide']]
    y = df['Yield']
    
    # Step 5: Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"✅ Train size: {len(X_train)} | Test size: {len(X_test)}")
    
    # Step 6: Train model
    print("\nStep 5: Training Random Forest model...")
    model, metrics, error = train_random_forest_model(X_train, X_test, y_train, y_test)
    if error:
        print(f"❌ {error}")
        return False
    
    # Step 7: Save model and logs
    print("\nStep 6: Saving model and logs...")
    success, error = save_model_and_logs(model, label_encoders, metrics, len(df))
    if error:
        print(f"❌ {error}")
        return False
    
    print("\n" + "="*60)
    print("✅ RETRAINING PIPELINE COMPLETED SUCCESSFULLY!")
    print("="*60 + "\n")
    
    return True

if __name__ == "__main__":
    success = retrain_pipeline()
    exit(0 if success else 1)
