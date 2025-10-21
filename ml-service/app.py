from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
import pickle
import os

app = Flask(__name__)
CORS(app)

# Global variables for model and encoders
model = None
label_encoders = {}
feature_columns = ['Crop', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']

def load_and_train_model():
    """Load data and train the model"""
    global model, label_encoders
    
    try:
        # Load the dataset
        df = pd.read_csv('../crop_yield.csv')
        
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
        
        # Calculate accuracy
        train_score = model.score(X_train, y_train)
        test_score = model.score(X_test, y_test)
        
        print(f"✅ Model trained successfully!")
        print(f"   Training R² Score: {train_score:.4f}")
        print(f"   Testing R² Score: {test_score:.4f}")
        
        # Save model
        with open('crop_yield_model.pkl', 'wb') as f:
            pickle.dump(model, f)
        with open('label_encoders.pkl', 'wb') as f:
            pickle.dump(label_encoders, f)
            
        return True
    except Exception as e:
        print(f"❌ Error training model: {str(e)}")
        return False

def load_saved_model():
    """Load saved model and encoders"""
    global model, label_encoders
    try:
        if os.path.exists('crop_yield_model.pkl') and os.path.exists('label_encoders.pkl'):
            with open('crop_yield_model.pkl', 'rb') as f:
                model = pickle.load(f)
            with open('label_encoders.pkl', 'rb') as f:
                label_encoders = pickle.load(f)
            print("✅ Loaded saved model")
            return True
        return False
    except Exception as e:
        print(f"❌ Error loading saved model: {str(e)}")
        return False

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
    success = load_and_train_model()
    if success:
        return jsonify({
            'message': 'Model trained successfully',
            'status': 'success'
        })
    else:
        return jsonify({
            'message': 'Error training model',
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
        
        # Validate required fields
        required_fields = ['Crop', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Encode categorical variables
        try:
            crop_encoded = label_encoders['Crop'].transform([data['Crop']])[0]
            season_encoded = label_encoders['Season'].transform([data['Season']])[0]
            state_encoded = label_encoders['State'].transform([data['State']])[0]
        except ValueError as e:
            return jsonify({
                'error': f'Invalid value for categorical field: {str(e)}',
                'available_crops': list(label_encoders['Crop'].classes_),
                'available_seasons': list(label_encoders['Season'].classes_),
                'available_states': list(label_encoders['State'].classes_)
            }), 400
        
        # Prepare features
        features = np.array([[
            crop_encoded,
            season_encoded,
            state_encoded,
            float(data['Area']),
            float(data['Annual_Rainfall']),
            float(data['Fertilizer']),
            float(data['Pesticide'])
        ]])
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Calculate estimated production
        estimated_production = prediction * float(data['Area'])
        
        return jsonify({
            'predicted_yield': round(float(prediction), 4),
            'estimated_production': round(float(estimated_production), 2),
            'input_data': data,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
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
