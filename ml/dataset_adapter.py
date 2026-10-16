from abc import ABC, abstractmethod
import pandas as pd

class DatasetAdapter(ABC):
    """
    Abstract interface to ensure any dataset can be swapped in 
    as long as it implements these methods.
    """

    @abstractmethod
    def load_data(self, filepath: str) -> pd.DataFrame:
        pass

    @abstractmethod
    def get_features(self) -> list:
        pass

    @abstractmethod
    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        pass

class AI4IDatasetAdapter(DatasetAdapter):
    
    def load_data(self, filepath: str) -> pd.DataFrame:
        return pd.read_csv(filepath)
        
    def get_features(self) -> list:
        return [
            'Air temperature [K]', 
            'Process temperature [K]', 
            'Rotational speed [rpm]', 
            'Torque [Nm]', 
            'Tool wear [min]',
            'Temp_diff'
        ]
        
    def preprocess(self, df: pd.DataFrame) -> pd.DataFrame:
        df['Temp_diff'] = df['Process temperature [K]'] - df['Air temperature [K]']
        return df
