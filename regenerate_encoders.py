"""
Script to regenerate label encoders from the cleaned dataset
This ensures all crops including Coconut are properly encoded
"""
import pandas as pd
import pickle
from sklearn.preprocessing import LabelEncoder
import shutil

print("=" * 60)
print("Regenerating Label Encoders")
print("=" * 60)

# Load the cleaned dataset
print("\n1. Loading cleaned dataset...")
df = pd.read_csv('crop_yield_cleaned.csv')
print(f"   ✅ Loaded {len(df)} records")

# Create label encoders for categorical columns
print("\n2. Creating label encoders...")
label_encoders = {}
categorical_columns = ['Crop', 'Season', 'State']

for col in categorical_columns:
    le = LabelEncoder()
    # Strip whitespace from values before fitting
    unique_values = df[col].str.strip().unique()
    le.fit(unique_values)
    label_encoders[col] = le
    print(f"   ✅ {col}: {len(le.classes_)} unique values")
    
    # Show sample values
    if col == 'Crop':
        print(f"      Sample crops: {list(le.classes_)[:10]}")
    elif col == 'Season':
        print(f"      Seasons: {list(le.classes_)}")
    elif col == 'State':
        print(f"      Sample states: {list(le.classes_)[:10]}")

# Save the label encoders to root directory
print("\n3. Saving label encoders...")
with open('label_encoders.pkl', 'wb') as f:
    pickle.dump(label_encoders, f)
print("   ✅ Saved to 'label_encoders.pkl'")

# Copy to ml-service folder
print("\n4. Copying to ml-service folder...")
shutil.copy('label_encoders.pkl', 'ml-service/label_encoders.pkl')
print("   ✅ Copied to 'ml-service/label_encoders.pkl'")

# Verify Coconut is included
print("\n5. Verification...")
coconut_variants = [c for c in label_encoders['Crop'].classes_ if 'coconut' in c.lower()]
if coconut_variants:
    print(f"   ✅ Coconut found in encoder: {coconut_variants}")
    print(f"   ✅ Coconut can now be predicted!")
else:
    print("   ❌ WARNING: Coconut NOT found in encoder")

print("\n" + "=" * 60)
print("✅ Label encoders regenerated successfully!")
print("=" * 60)
print("\nNext steps:")
print("1. Restart your ML service (python app.py)")
print("2. Try predicting Coconut again")
print("   Note: Use 'Coconut' (without trailing space) in your requests")
