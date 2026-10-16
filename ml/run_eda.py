import pandas as pd
import urllib.request
import os

os.makedirs('ml/data', exist_ok=True)
url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/00601/ai4i2020.csv'
filepath = 'ml/data/ai4i2020.csv'

if not os.path.exists(filepath):
    print("Downloading dataset...")
    urllib.request.urlretrieve(url, filepath)

df = pd.read_csv(filepath)

print("--- EDA ---")
print("Columns:", df.columns.tolist())
print("\nShape:", df.shape)
print("\nMissing Values:")
print(df.isnull().sum())
print("\nClass Distribution (Machine failure):")
print(df['Machine failure'].value_counts(normalize=True))
print("\nFailure Types Distribution:")
for col in ['TWF', 'HDF', 'PWF', 'OSF', 'RNF']:
    print(col, df[col].sum())
