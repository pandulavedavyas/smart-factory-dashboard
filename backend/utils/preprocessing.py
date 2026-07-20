import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, LabelEncoder


def encode_categorical(df):
    le = LabelEncoder()
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = le.fit_transform(df[col].astype(str))
    return df


def normalize_features(df, exclude=None):
    scaler = StandardScaler()
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if exclude:
        numeric_cols = [c for c in numeric_cols if c not in exclude]
    if numeric_cols:
        df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
    return df, scaler


def detect_outliers_iqr(df, column):
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    outliers = df[(df[column] < lower) | (df[column] > upper)]
    return len(outliers), int(lower), int(upper)
