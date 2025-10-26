# ML Model Files

## ⚠️ Important Notice

The trained model files are **NOT included in the Git repository** due to their large size (>100 MB). GitHub does not allow files larger than 100 MB.

## Required Model Files

The following model files should be present in the `ml-service/` directory:

1. **`best_crop_yield_model_Random_Forest.pkl`** (~344 MB)
   - Main crop yield prediction model
   - Trained Random Forest model
   
2. **`fertilizer_pesticide_model.pkl`** (~4.3 MB)
   - Fertilizer and pesticide prediction model
   
3. **`label_encoders.pkl`** (~1 KB)
   - Label encoders for categorical features (Crop, Season, State)

## How to Get Model Files

### Option 1: Download from Cloud Storage
If you have these files stored in cloud storage (Google Drive, Dropbox, etc.), download them and place them in the `ml-service/` directory.

### Option 2: Train the Models
If you have the training data, you can retrain the models:

1. Ensure you have the datasets:
   - `crop_yield_cleaned_encoded.csv` (in project root)
   
2. Run the training script:
   ```bash
   cd ml-service
   python retrain_model.py
   ```

3. The script will generate all required model files.

## File Verification

After obtaining the model files, verify they exist:

```bash
cd ml-service
ls *.pkl
```

You should see:
- `best_crop_yield_model_Random_Forest.pkl`
- `fertilizer_pesticide_model.pkl`
- `label_encoders.pkl`

## Starting the ML Service

Once model files are in place:

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
python app.py
```

The ML service will run on `http://localhost:5001`

## Notes

- These model files are listed in `.gitignore` and will not be tracked by Git
- Keep backup copies of trained models in secure cloud storage
- Model files are essential for the application to work
