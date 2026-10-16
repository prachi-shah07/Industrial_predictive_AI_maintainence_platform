# Exploratory Data Analysis: AI4I 2020 Predictive Maintenance Dataset

## 1. Dataset Overview & Columns
The dataset contains 10,000 instances and 14 features:
- **UDI**: Unique identifier (1 to 10000).
- **Product ID**: Character string containing the product quality variant (L, M, H) and a serial number.
- **Type**: Product quality variant (L, M, H).
- **Air temperature [K]**: Generated using a random walk process.
- **Process temperature [K]**: Generated using a random walk process, added to air temperature.
- **Rotational speed [rpm]**: Calculated from power.
- **Torque [Nm]**: Normally distributed around 40 Nm.
- **Tool wear [min]**: Tool wear time.
- **Machine failure**: Target variable, 1 if the machine failed, 0 otherwise.
- **TWF**: Tool wear failure (binary).
- **HDF**: Heat dissipation failure (binary).
- **PWF**: Power failure (binary).
- **OSF**: Overstrain failure (binary).
- **RNF**: Random failure (binary).

## 2. Target Variable(s)
- Primary Target (Binary Classification): `Machine failure` (0 or 1).
- Secondary Target (Multiclass Classification / Anomaly Detection): `TWF`, `HDF`, `PWF`, `OSF`, `RNF` are individual failure modes.

## 3. Missing Values
There are **0 missing values** across all columns.

## 4. Class Distribution
- **Healthy (0)**: 96.61%
- **Failed (1)**: 3.39%
The dataset is highly imbalanced, which requires special attention (e.g., SMOTE, class weights, or careful metric selection like PR-AUC) during modeling.

Failure type breakdown:
- HDF: 115
- OSF: 98
- PWF: 95
- TWF: 46
- RNF: 19

## 5. Temporal Structure
The dataset is fundamentally cross-sectional (each row is independent). However, to satisfy the brief's requirement for Remaining Useful Life (RUL) prediction, we will logically group machines and simulate sequence identifiers, or use `Tool wear [min]` as a proxy for the timeline since it strictly monotonically increases until failure or maintenance.

## 6. Possible Data Leakage Sources
The columns `TWF`, `HDF`, `PWF`, `OSF`, and `RNF` sum up to `Machine failure`. If we use them as input features to predict `Machine failure`, it will result in 100% data leakage. These columns MUST be excluded from the feature set when predicting general machine failure.

## 7. Assumptions Being Made
- `UDI` is ordered but not strictly temporal for a single machine; we will treat sequences of `Tool wear [min]` for each `Type` as proxy timelines to construct sequences for RUL.
- We assume `Type` correlates with inherent machine reliability (L=low, M=medium, H=high).
