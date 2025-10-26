from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import pickle
import os
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Global variables for model and encoders
model = None
label_encoders = {}
feature_columns = ['Crop', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
MODEL_PATH = 'best_crop_yield_model_Random_Forest.pkl'
ENCODERS_PATH = 'label_encoders.pkl'
RETRAINING_LOG_PATH = 'retraining_log.json'

# Fertilizer & Pesticide prediction model
fert_pest_model = None
FERT_PEST_MODEL_PATH = 'fertilizer_pesticide_model.pkl'

def load_and_train_model():
    """Load data and train the model"""
    global model, label_encoders
    
    try:
        start_time = datetime.now()
        
        # Load the dataset - try cleaned version first
        if os.path.exists('../crop_yield_cleaned.csv'):
            df = pd.read_csv('../crop_yield_cleaned.csv')
            print("✅ Loaded cleaned dataset")
        else:
            df = pd.read_csv('../crop_yield.csv')
            print("✅ Loaded original dataset")
        
        # Clean data
        df = df.dropna()
        df = df[df['Yield'] > 0]  # Remove invalid yields
        
        # Encode categorical variables
        categorical_columns = ['Crop', 'Season', 'State']
        for col in categorical_columns:
            le = LabelEncoder()
            df[col + '_encoded'] = le.fit_transform(df[col])
            label_encoders[col] = le
        
        # Prepare features and target
        X = df[['Crop_encoded', 'Season_encoded', 'State_encoded', 'Area', 
                'Annual_Rainfall', 'Fertilizer', 'Pesticide']]
        y = df['Yield']
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest model
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=20,
            min_samples_split=10,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        
        # Calculate metrics
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        training_duration = (datetime.now() - start_time).total_seconds()
        
        print(f"✅ Model trained successfully!")
        print(f"   Training R² Score: {train_score:.4f}")
        print(f"   Testing R² Score: {test_score:.4f}")
        print(f"   MSE: {mse:.4f}")
        print(f"   RMSE: {rmse:.4f}")
        print(f"   R² Score: {r2:.4f}")
        print(f"   Training Duration: {training_duration:.2f}s")
        
        # Save model using pickle
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump(model, f)
        print(f"✅ Model saved to {MODEL_PATH}")
        
        # Save encoders
        with open(ENCODERS_PATH, 'wb') as f:
            pickle.dump(label_encoders, f)
        print(f"✅ Encoders saved to {ENCODERS_PATH}")
        
        # Log retraining details
        log_entry = {
            'retrain_date': datetime.now().isoformat(),
            'model_version': 'Random_Forest_v1.0',
            'dataset_size': len(df),
            'metrics': {
                'mse': float(mse),
                'rmse': float(rmse),
                'r2_score': float(r2),
                'train_score': float(train_score),
                'test_score': float(test_score)
            },
            'training_duration_seconds': training_duration,
            'data_summary': {
                'total_records': len(df),
                'features_count': X.shape[1]
            },
            'status': 'success'
        }
        
        # Save to retraining log
        logs = []
        if os.path.exists(RETRAINING_LOG_PATH):
            with open(RETRAINING_LOG_PATH, 'r') as f:
                logs = json.load(f)
        logs.append(log_entry)
        
        with open(RETRAINING_LOG_PATH, 'w') as f:
            json.dump(logs, f, indent=2)
        print(f"✅ Retraining log updated")
            
        return True, log_entry
    except Exception as e:
        print(f"❌ Error training model: {str(e)}")
        return False, {'error': str(e)}

def load_saved_model():
    """Load saved model and encoders"""
    global model, label_encoders, fert_pest_model
    try:
        # Try to load pickle model
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            print(f"✅ Loaded saved Random Forest model from {MODEL_PATH}")
            
            # Load encoders
            if os.path.exists(ENCODERS_PATH):
                with open(ENCODERS_PATH, 'rb') as f:
                    label_encoders = pickle.load(f)
                print("✅ Loaded label encoders")
            else:
                # Train encoders from dataset if not found
                print("⚠️ Encoders not found, creating from dataset...")
                create_encoders_from_dataset()
            
            # Load fertilizer/pesticide prediction model - USE JOBLIB
            if os.path.exists(FERT_PEST_MODEL_PATH):
                try:
                    print(f"🔄 Loading Fertilizer/Pesticide model from {FERT_PEST_MODEL_PATH}...")
                    fert_pest_model = joblib.load(FERT_PEST_MODEL_PATH)
                    print(f"✅ Loaded Fertilizer/Pesticide prediction model (type: {type(fert_pest_model).__name__})")
                    
                    # Verify it's a valid model with predict method
                    if not hasattr(fert_pest_model, 'predict'):
                        print(f"⚠️ WARNING: Loaded object doesn't have predict method. Type: {type(fert_pest_model)}")
                        fert_pest_model = None
                    else:
                        print(f"✅ Model verification passed - has predict method")
                        
                except Exception as e:
                    print(f"❌ Error loading Fertilizer/Pesticide model: {str(e)}")
                    print(f"   Trying with pickle...")
                    try:
                        with open(FERT_PEST_MODEL_PATH, 'rb') as f:
                            fert_pest_model = pickle.load(f)
                        print(f"✅ Loaded with pickle (type: {type(fert_pest_model).__name__})")
                        
                        # Verify it's valid
                        if not hasattr(fert_pest_model, 'predict'):
                            print(f"⚠️ WARNING: Loaded object doesn't have predict method")
                            fert_pest_model = None
                    except Exception as e2:
                        print(f"❌ Failed with pickle too: {str(e2)}")
                        fert_pest_model = None
            else:
                print("⚠️ Fertilizer/Pesticide model not found. Auto-prediction will not be available.")
            
            return True
        elif os.path.exists('best_crop_yield_model_Random_Forest.joblib'):
            # Fallback to old joblib model if exists
            model = joblib.load('best_crop_yield_model_Random_Forest.joblib')
            print("✅ Loaded old joblib model (converting to pickle)")
            # Save as pickle
            with open(MODEL_PATH, 'wb') as f:
                pickle.dump(model, f)
            print(f"✅ Converted and saved to {MODEL_PATH}")
            
            # Load encoders
            if os.path.exists(ENCODERS_PATH):
                with open(ENCODERS_PATH, 'rb') as f:
                    label_encoders = pickle.load(f)
                print("✅ Loaded label encoders")
            return True
        return False
    except Exception as e:
        print(f"❌ Error loading saved model: {str(e)}")
        return False

def create_encoders_from_dataset():
    """Create label encoders from the dataset"""
    global label_encoders
    try:
        df = pd.read_csv('../crop_yield_cleaned.csv')
        categorical_columns = ['Crop', 'Season', 'State']
        for col in categorical_columns:
            le = LabelEncoder()
            le.fit(df[col].unique())
            label_encoders[col] = le
        
        # Save encoders
        with open(ENCODERS_PATH, 'wb') as f:
            pickle.dump(label_encoders, f)
        print("✅ Created and saved label encoders")
    except Exception as e:
        print(f"❌ Error creating encoders: {str(e)}")

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'message': 'Crop Yield Prediction ML Service',
        'status': 'running',
        'model_loaded': model is not None
    })

@app.route('/train', methods=['POST'])
def train():
    """Train or retrain the model"""
    success, result = load_and_train_model()
    if success:
        return jsonify({
            'message': 'Model trained successfully',
            'status': 'success',
            'metrics': result.get('metrics', {}),
            'training_info': result
        })
    else:
        return jsonify({
            'message': 'Error training model',
            'status': 'error',
            'error': result.get('error', 'Unknown error')
        }), 500

@app.route('/retrain', methods=['POST'])
def retrain():
    """Retrain the model with updated data from MongoDB or new predictions"""
    try:
        # This will fetch data from MongoDB if connected, otherwise from CSV
        success, result = load_and_train_model()
        
        if success:
            return jsonify({
                'message': 'Model retrained successfully',
                'status': 'success',
                'retraining_info': result
            })
        else:
            return jsonify({
                'message': 'Error retraining model',
                'status': 'error',
                'error': result.get('error', 'Unknown error')
            }), 500
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/retraining-logs', methods=['GET'])
def get_retraining_logs():
    """Get retraining history logs"""
    try:
        if os.path.exists(RETRAINING_LOG_PATH):
            with open(RETRAINING_LOG_PATH, 'r') as f:
                logs = json.load(f)
            return jsonify({
                'logs': logs,
                'count': len(logs),
                'status': 'success'
            })
        else:
            return jsonify({
                'logs': [],
                'count': 0,
                'status': 'success',
                'message': 'No retraining logs found'
            })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Predict crop yield"""
    try:
        if model is None:
            return jsonify({
                'error': 'Model not loaded. Please train the model first.'
            }), 400
        
        data = request.json
        print(f"📥 Received data: {data}")
        
        # Validate required fields (Crop_Year is optional, will default to current year)
        required_fields = ['Crop', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Normalize input data - strip all whitespace since encoders are now created from stripped values
        crop_value = str(data['Crop']).strip()
        season_value = str(data['Season']).strip()  # Remove all trailing/leading spaces
        state_value = str(data['State']).strip()
        
        print(f"🔍 Normalized values - Crop: '{crop_value}', Season: '{season_value}', State: '{state_value}'")
        
        # Encode categorical variables using the label encoders
        try:
            crop_encoded = label_encoders['Crop'].transform([crop_value])[0]
            season_encoded = label_encoders['Season'].transform([season_value])[0]
            state_encoded = label_encoders['State'].transform([state_value])[0]
            print(f"✅ Encoded successfully: Crop={crop_encoded}, Season={season_encoded}, State={state_encoded}")
        except ValueError as e:
            print(f"❌ Encoding error: {str(e)}")
            # Get available values for better error message
            available_crops = list(label_encoders['Crop'].classes_) if 'Crop' in label_encoders else []
            available_seasons = list(label_encoders['Season'].classes_) if 'Season' in label_encoders else []
            available_states = list(label_encoders['State'].classes_) if 'State' in label_encoders else []
            
            return jsonify({
                'error': f'Invalid value for categorical field: {str(e)}',
                'hint': 'Please check the exact spelling and spacing of categorical values',
                'available_crops': available_crops[:10],  # Show first 10
                'available_seasons': available_seasons,
                'available_states': available_states[:10],  # Show first 10
                'your_input': {
                    'Crop': crop_value,
                    'Season': season_value,
                    'State': state_value
                }
            }), 400
        
        # Prepare features as DataFrame with encoded values
        # IMPORTANT: Column names must match what model expects (not _encoded suffix)
        # Model expects: Crop, Crop_Year, Season, State, Area, Production, Annual_Rainfall, Fertilizer, Pesticide
        
        # Get Crop_Year from request or use current year as default
        crop_year = int(data.get('Crop_Year', 2025))
        
        features_df = pd.DataFrame({
            'Crop': [crop_encoded],  # Use 'Crop' not 'Crop_encoded'
            'Crop_Year': [crop_year],  # Add Crop_Year
            'Season': [season_encoded],  # Use 'Season' not 'Season_encoded'
            'State': [state_encoded],  # Use 'State' not 'State_encoded'
            'Area': [float(data['Area'])],
            'Production': [0.0],  # Add Production with placeholder (will be calculated later)
            'Annual_Rainfall': [float(data['Annual_Rainfall'])],
            'Fertilizer': [float(data['Fertilizer'])],
            'Pesticide': [float(data['Pesticide'])]
        })
        
        # Reorder columns to match model's expected feature order
        if hasattr(model, 'feature_names_in_'):
            features_df = features_df[model.feature_names_in_]
            print(f"✅ Reordered columns to match model: {list(features_df.columns)}")
        
        # Make prediction
        print(f"🔮 Making prediction with features: {features_df.to_dict()}")
        prediction = model.predict(features_df)[0]
        
        # Handle negative predictions - ensure non-negative values
        prediction = max(0.0, float(prediction))
        print(f"✅ Prediction successful: {prediction}")
        
        # Calculate estimated production
        estimated_production = prediction * float(data['Area'])
        
        return jsonify({
            'predicted_yield': round(float(prediction), 4),
            'estimated_production': round(float(estimated_production), 2),
            'input_data': data,
            'status': 'success'
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'error_type': type(e).__name__,
            'status': 'error'
        }), 500

@app.route('/predict-inputs', methods=['POST'])
def predict_inputs():
    """Predict Fertilizer and Pesticide requirements based on crop details"""
    try:
        if fert_pest_model is None:
            return jsonify({
                'error': 'Fertilizer/Pesticide prediction model not loaded',
                'message': 'Please ensure fertilizer_pesticide_model.pkl exists in ml-service folder'
            }), 400
        
        data = request.json
        print(f"📥 Received input prediction request: {data}")
        
        # Validate required fields (no Fertilizer/Pesticide needed for input)
        required_fields = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Annual_Rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Prepare input DataFrame exactly as the model expects
        input_df = pd.DataFrame({
            'Crop': [str(data['Crop']).strip()],
            'Crop_Year': [int(data['Crop_Year'])],
            'Season': [str(data['Season']).strip()],
            'State': [str(data['State']).strip()],
            'Area': [float(data['Area'])],
            'Annual_Rainfall': [float(data['Annual_Rainfall'])]
        })
        
        print(f"🔮 Predicting inputs with: {input_df.to_dict()}")
        print(f"🔍 Model type: {type(fert_pest_model).__name__}")
        print(f"🔍 Model has predict: {hasattr(fert_pest_model, 'predict')}")
        
        # Verify model is valid before prediction
        if not hasattr(fert_pest_model, 'predict'):
            return jsonify({
                'error': 'Invalid model object',
                'message': f'Loaded model is of type {type(fert_pest_model).__name__} and does not have predict method',
                'hint': 'Please retrain and save the fertilizer/pesticide model correctly'
            }), 500
        
        # Make prediction - returns array with shape (1, 2) for [Fertilizer, Pesticide]
        predictions = fert_pest_model.predict(input_df)
        print(f"🔍 Predictions shape: {predictions.shape if hasattr(predictions, 'shape') else 'N/A'}")
        print(f"🔍 Raw predictions: {predictions}")
        
        # Handle different prediction formats
        if len(predictions.shape) == 2:
            predicted_fertilizer = float(predictions[0][0])
            predicted_pesticide = float(predictions[0][1])
        else:
            predicted_fertilizer = float(predictions[0])
            predicted_pesticide = float(predictions[1])
        
        # Handle negative predictions - clamp to zero
        # Fertilizer and Pesticide cannot be negative
        predicted_fertilizer = max(0.0, predicted_fertilizer)
        predicted_pesticide = max(0.0, predicted_pesticide)
        
        print(f"✅ Input prediction successful: Fertilizer={predicted_fertilizer:.2f}, Pesticide={predicted_pesticide:.2f}")
        
        return jsonify({
            'predicted_fertilizer': round(predicted_fertilizer, 2),
            'predicted_pesticide': round(predicted_pesticide, 2),
            'input_data': data,
            'status': 'success',
            'message': 'Successfully predicted fertilizer and pesticide requirements'
        })
        
    except Exception as e:
        print(f"❌ Input prediction error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'error_type': type(e).__name__,
            'status': 'error'
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the model"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 400
    
    return jsonify({
        'model_type': type(model).__name__,
        'available_crops': list(label_encoders['Crop'].classes_),
        'available_seasons': list(label_encoders['Season'].classes_),
        'available_states': list(label_encoders['State'].classes_),
        'feature_importance': dict(zip(
            ['Crop', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide'],
            [float(x) for x in model.feature_importances_]
        ))
    })

if __name__ == '__main__':
    # Try to load saved model, otherwise train new one
    if not load_saved_model():
        print("No saved model found. Training new model...")
        load_and_train_model()
    
    app.run(host='0.0.0.0', port=5001, debug=True)
