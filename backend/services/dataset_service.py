import os
import csv
import json
import pandas as pd
import numpy as np
from io import StringIO
from datetime import datetime
from werkzeug.utils import secure_filename


ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def load_dataframe(filepath, filename):
    ext = filename.rsplit(".", 1)[1].lower()
    if ext == "csv":
        return pd.read_csv(filepath)
    else:
        return pd.read_excel(filepath)


def clean_dataset(df):
    report = {
        "original_rows": len(df),
        "original_cols": len(df.columns),
        "missing_before": int(df.isnull().sum().sum()),
        "duplicates": int(df.duplicated().sum()),
        "columns": list(df.columns),
    }

    # Remove duplicates
    df = df.drop_duplicates()

    # Handle missing values
    for col in df.columns:
        if df[col].dtype in ["float64", "int64"]:
            df[col].fillna(df[col].median(), inplace=True)
        else:
            df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "", inplace=True)

    # Convert date columns
    for col in df.columns:
        if "date" in col.lower() or "time" in col.lower():
            try:
                df[col] = pd.to_datetime(df[col])
            except:
                pass

    report["missing_after"] = int(df.isnull().sum().sum())
    report["final_rows"] = len(df)
    report["final_cols"] = len(df.columns)
    report["dtypes"] = {str(k): str(v) for k, v in df.dtypes.items()}

    return df, report


def summary_stats(df):
    desc = df.describe(include="all").to_dict()
    # Convert numpy types
    cleaned = {}
    for col, stats in desc.items():
        cleaned[str(col)] = {
            str(k): (float(v) if isinstance(v, (np.integer, np.floating)) else
                     str(v) if pd.isna(v) else v)
            for k, v in stats.items()
        }
    return cleaned


def missing_values(df):
    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(2)
    result = {}
    for col in df.columns:
        result[str(col)] = {
            "missing": int(missing[col]),
            "percentage": float(missing_pct[col])
        }
    return result


def correlation_matrix(df):
    numeric = df.select_dtypes(include=[np.number])
    if numeric.empty:
        return {}
    corr = numeric.corr()
    result = {}
    for col in corr.columns:
        result[str(col)] = {str(k): (float(v) if not pd.isna(v) else 0) for k, v in corr[col].items()}
    return result


def get_preview(df, rows=10):
    preview = df.head(rows).to_dict(orient="records")
    # Convert types for JSON
    cleaned = []
    for row in preview:
        r = {}
        for k, v in row.items():
            if isinstance(v, (np.integer,)):
                r[str(k)] = int(v)
            elif isinstance(v, (np.floating,)):
                r[str(k)] = float(v)
            elif pd.isna(v):
                r[str(k)] = None
            elif isinstance(v, pd.Timestamp):
                r[str(k)] = str(v)
            else:
                r[str(k)] = v
        cleaned.append(r)
    return cleaned
