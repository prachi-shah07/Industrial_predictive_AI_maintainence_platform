import pandas as pd
import numpy as np
import joblib
import json
import shap
import os
import mlflow
import mlflow.sklearn
import mlflow.xgboost
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, IsolationForest
from sklearn.svm import OneClassSVM
from xgboost import XGBClassifier, XGBRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

mlflow.set_tracking_uri("sqlite:///mlflow.db")
mlflow.set_experiment("Predictive_Maintenance_Models")

def train_and_evaluate():
    with mlflow.start_run(run_name="Full_Training_Pipeline"):
        print("Loading preprocessed data...")
        X_train = pd.read_csv('data/processed/X_train.csv')
        X_train.columns = [c.replace('[', '').replace(']', '').replace('<', '') for c in X_train.columns]
        y_train_fail = pd.read_csv('data/processed/y_train_fail.csv')['Machine failure']
        y_train_rul = pd.read_csv('data/processed/y_train_rul.csv')['RUL']
        
        X_val = pd.read_csv('data/processed/X_val.csv')
        X_val.columns = [c.replace('[', '').replace(']', '').replace('<', '') for c in X_val.columns]
        y_val_fail = pd.read_csv('data/processed/y_val_fail.csv')['Machine failure']
        y_val_rul = pd.read_csv('data/processed/y_val_rul.csv')['RUL']

        metrics = {}

        print("\n--- Training Model 1: Failure Prediction ---")
        fail_models = {
            'Logistic Regression': LogisticRegression(max_iter=1000, class_weight='balanced'),
            'Random Forest': RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42),
            'XGBoost': XGBClassifier(scale_pos_weight=96/4, use_label_encoder=False, eval_metric='logloss', random_state=42)
        }

        best_fail_f1 = -1
        best_fail_model = None
        best_fail_name = ""

        for name, model in fail_models.items():
            model.fit(X_train, y_train_fail)
            preds = model.predict(X_val)
            probs = model.predict_proba(X_val)[:, 1] if hasattr(model, "predict_proba") else preds
            
            f1 = f1_score(y_val_fail, preds)
            metrics[f'Failure_{name}'] = {
                'Accuracy': float(accuracy_score(y_val_fail, preds)),
                'Precision': float(precision_score(y_val_fail, preds)),
                'Recall': float(recall_score(y_val_fail, preds)),
                'F1': float(f1),
                'ROC_AUC': float(roc_auc_score(y_val_fail, probs))
            }
            
            if f1 > best_fail_f1:
                best_fail_f1 = f1
                best_fail_model = model
                best_fail_name = name

        print(f"Best Failure Model: {best_fail_name} with F1: {best_fail_f1:.4f}")
        joblib.dump(best_fail_model, 'models/failure_model.pkl')
        mlflow.log_metric("Best_Fail_F1", best_fail_f1)
        
        # Generate SHAP explainer for best model
        print("Generating SHAP Explainer...")
        if 'Random Forest' in best_fail_name or 'XGBoost' in best_fail_name:
            explainer = shap.TreeExplainer(best_fail_model)
        else:
            background = shap.maskers.Independent(X_train, max_samples=100)
            explainer = shap.Explainer(best_fail_model, background)
        
        joblib.dump(explainer, 'models/shap_explainer.pkl')

        print("\n--- Training Model 2: Anomaly Detection ---")
        iso_forest = IsolationForest(contamination=0.04, random_state=42)
        iso_forest.fit(X_train)
        anom_preds = (iso_forest.predict(X_val) == -1).astype(int)
        
        metrics['Anomaly_Isolation_Forest'] = {
            'Precision': float(precision_score(y_val_fail, anom_preds)),
            'Recall': float(recall_score(y_val_fail, anom_preds)),
            'F1': float(f1_score(y_val_fail, anom_preds))
        }
        joblib.dump(iso_forest, 'models/anomaly_model.pkl')
        mlflow.sklearn.log_model(iso_forest, "anomaly_model")
        print("Anomaly Detection Model saved.")

        print("\n--- Training Model 3: RUL Prediction ---")
        rul_models = {
            'Random Forest Regressor': RandomForestRegressor(n_estimators=100, random_state=42),
            'XGBoost Regressor': XGBRegressor(n_estimators=100, random_state=42)
        }

        best_rul_mae = float('inf')
        best_rul_model = None
        best_rul_name = ""

        for name, model in rul_models.items():
            model.fit(X_train, y_train_rul)
            preds = model.predict(X_val)
            
            mae = mean_absolute_error(y_val_rul, preds)
            metrics[f'RUL_{name}'] = {
                'MAE': float(mae),
                'RMSE': float(np.sqrt(mean_squared_error(y_val_rul, preds))),
                'R2': float(r2_score(y_val_rul, preds))
            }
            
            if mae < best_rul_mae:
                best_rul_mae = mae
                best_rul_model = model
                best_rul_name = name

        print(f"Best RUL Model: {best_rul_name} with MAE: {best_rul_mae:.4f}")
        joblib.dump(best_rul_model, 'models/rul_model.pkl')
        mlflow.log_metric("Best_RUL_MAE", best_rul_mae)

        print("\nSaving metrics...")
        with open('models/metrics.json', 'w') as f:
            json.dump(metrics, f, indent=4)
        
        for k, v in metrics.items():
            for m_name, m_val in v.items():
                mlflow.log_metric(f"{k}_{m_name}", m_val)

        print("Phase 3 complete! All models trained and saved.")

if __name__ == "__main__":
    train_and_evaluate()
