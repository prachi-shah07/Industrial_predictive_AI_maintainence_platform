import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

def preprocess_and_split():
    print("Loading data...")
    df = pd.read_csv('data/ai4i2020.csv')

    print("Engineering features...")
    # 1. Temperature Difference
    df['Temp_diff'] = df['Process temperature [K]'] - df['Air temperature [K]']

    # 2. Simulate Machine IDs and RUL (Remaining Useful Life)
    # The dataset doesn't have explicit temporal sequences. 
    # We will simulate sequences by assuming rows are chronological and a failure resets the "machine".
    machine_ids = []
    current_id = 1
    for index, row in df.iterrows():
        machine_ids.append(current_id)
        if row['Machine failure'] == 1:
            current_id += 1
    
    df['Machine_ID'] = machine_ids

    # Calculate RUL: number of cycles (rows) remaining until failure for each Machine_ID
    # For machines that don't fail by the end of the dataset, we assume RUL is large or unknown, 
    # but for simplicity, we treat the max cycle in the group as the end of life.
    df['Cycle'] = df.groupby('Machine_ID').cumcount() + 1
    max_cycles = df.groupby('Machine_ID')['Cycle'].transform('max')
    df['RUL'] = max_cycles - df['Cycle']

    # Drop leakage columns
    leakage_cols = ['TWF', 'HDF', 'PWF', 'OSF', 'RNF']
    df = df.drop(columns=leakage_cols)

    # 3. Categorical Encoding
    # One-hot encode 'Type'
    df = pd.get_dummies(df, columns=['Type'], drop_first=True)

    # Set features and targets
    # Exclude UDI, Product ID, Machine_ID, Cycle, RUL, Machine failure from X
    drop_cols_X = ['UDI', 'Product ID', 'Machine_ID', 'Cycle', 'RUL', 'Machine failure']
    X = df.drop(columns=drop_cols_X)
    
    # Target 1: Machine failure
    y_fail = df['Machine failure']
    
    # Target 2: RUL
    y_rul = df['RUL']

    print("Splitting data...")
    # We use a standard train/test split. For RUL temporal sequences, a group-based split is better.
    # GroupShuffleSplit to keep Machine_IDs together
    from sklearn.model_selection import GroupShuffleSplit
    gss = GroupShuffleSplit(n_splits=1, train_size=0.8, random_state=42)
    train_idx, temp_idx = next(gss.split(X, y_fail, groups=df['Machine_ID']))
    
    # Split temp into val and test
    gss_temp = GroupShuffleSplit(n_splits=1, train_size=0.5, random_state=42)
    val_idx, test_idx = next(gss_temp.split(X.iloc[temp_idx], y_fail.iloc[temp_idx], groups=df['Machine_ID'].iloc[temp_idx]))
    val_idx = temp_idx[val_idx]
    test_idx = temp_idx[test_idx]

    X_train, y_train_fail, y_train_rul = X.iloc[train_idx], y_fail.iloc[train_idx], y_rul.iloc[train_idx]
    X_val, y_val_fail, y_val_rul = X.iloc[val_idx], y_fail.iloc[val_idx], y_rul.iloc[val_idx]
    X_test, y_test_fail, y_test_rul = X.iloc[test_idx], y_fail.iloc[test_idx], y_rul.iloc[test_idx]

    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(scaler.fit_transform(X_train), columns=X_train.columns)
    X_val_scaled = pd.DataFrame(scaler.transform(X_val), columns=X_val.columns)
    X_test_scaled = pd.DataFrame(scaler.transform(X_test), columns=X_test.columns)

    # Save processed data and scaler
    os.makedirs('data/processed', exist_ok=True)
    os.makedirs('models', exist_ok=True)

    # Save X and y splits
    X_train_scaled.to_csv('data/processed/X_train.csv', index=False)
    y_train_fail.to_csv('data/processed/y_train_fail.csv', index=False)
    y_train_rul.to_csv('data/processed/y_train_rul.csv', index=False)
    
    X_val_scaled.to_csv('data/processed/X_val.csv', index=False)
    y_val_fail.to_csv('data/processed/y_val_fail.csv', index=False)
    y_val_rul.to_csv('data/processed/y_val_rul.csv', index=False)
    
    X_test_scaled.to_csv('data/processed/X_test.csv', index=False)
    y_test_fail.to_csv('data/processed/y_test_fail.csv', index=False)
    y_test_rul.to_csv('data/processed/y_test_rul.csv', index=False)

    # Also save the original test set with ID and RUL for evaluation plotting later
    df.iloc[test_idx].to_csv('data/processed/test_full.csv', index=False)

    joblib.dump(scaler, 'models/scaler.pkl')
    print("Data preprocessing complete. Artifacts saved in data/processed/ and models/")

if __name__ == "__main__":
    preprocess_and_split()
