# Interactive Web Platform for Stock and Gold Data Analysis

**Project ID:** UQU-DS-2025-M03  
**Institution:** Umm Al-Qura University — College of Computing, Data Science Department  
**Supervisor:** Dr. Yasser Al-Saleh  
**Team:** Marwan Al Otaibi · Yazeed Al Sayari · Abdulmohsen Asiri · Nawaf Aladwani

---

## Project Overview

A Decision Support System (DSS) that integrates historical price data, technical indicators, and financial news sentiment to generate BUY/HOLD/SELL investment recommendations for Apple stock (AAPL) and Gold futures (GC=F).

**Two parallel tasks:**
- **Task 1 — Sentiment Analysis:** VADER vs Logistic Regression (TF-IDF) vs RoBERTa
- **Task 2 — Price Prediction:** XGBoost vs Linear Regression (technical only) vs Random Forest

**Data Coverage Range:**
| Asset | File | Start Date | End Date | Labels |
|-------|------|-----------|----------|--------|
| AAPL price (Yahoo Finance) | — | 2020-01-01 | 2026-05-10 | — |
| Gold price (Yahoo Finance) | — | 2020-01-01 | 2026-05-10 | — |
| AAPL news | apple_news_clean.xlsx | 2025-01-01 | 2026-05-10 | ✅ Yes |
| Gold news | gold_news_clean.xlsx | 2025-12-01 | 2026-05-10 | ✅ Yes |
| AAPL news | apple_cleaned_dataset.csv | 2020-01-01 | 2022-12-31 | ❌ No |
| Gold news | gold_cleaned_dataset.csv | 2020-01-01 | 2022-12-31 | ❌ No |
| AAPL news | apple_cleaned_dataset1.csv | 2023-01-01 | 2024-12-30 | ❌ No |
| Gold news | gold_cleaned_dataset1.csv | 2023-01-02 | 2024-12-31 | ❌ No |

---

## Project Structure

```
stock_analysis/
├── stock_analysis.ipynb            # Main Colab notebook (all 8 sections)
├── data/
│   ├── apple_news_clean.xlsx       # AAPL labeled news (2025-2026)
│   ├── gold_news_clean.xlsx        # Gold labeled news (2025-2026)
│   ├── apple_cleaned_dataset.csv   # AAPL historical news (2020-2022)
│   ├── gold_cleaned_dataset.csv    # Gold historical news (2020-2022)
│   ├── apple_cleaned_dataset1.csv  # AAPL extended news (2023-2024)
│   └── gold_cleaned_dataset1.csv   # Gold extended news (2023-2024)
├── README.md
└── requirements.txt
```

---

## Quick Start (Google Colab)

### Step 1 — Upload Files
Upload the following to your Colab session or mount Google Drive:
- `stock_analysis.ipynb`
- `apple_news_clean.xlsx`
- `gold_news_clean.xlsx`
- `apple_cleaned_dataset.csv`
- `gold_cleaned_dataset.csv`
- `apple_cleaned_dataset1.csv`
- `gold_cleaned_dataset1.csv`

### Step 2 — Install Dependencies
Run **Section 1** of the notebook:
```python
!pip install transformers torch vaderSentiment yfinance xgboost plotly nltk openpyxl -q
```

### Step 3 — Download NLTK Resources
```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
```

### Step 4 — Run Sections in Order

| Section | Description | Est. Time |
|---------|-------------|-----------|
| Section 1 | Install dependencies | 2 min |
| Section 2 | Load & merge news data | 1 min |
| Section 3 | Sentiment analysis (VADER, LR, RoBERTa) | 15–30 min* |
| Section 4 | Download price data from Yahoo Finance | 1 min |
| Section 5 | Technical indicators & feature engineering | 1 min |
| Section 6 | Train price prediction models | 3–5 min |
| Section 7 | Visualizations & BUY/HOLD/SELL signals | 2 min |
| Section 8 | Final comparison tables & summary | 1 min |

> *RoBERTa inference is cached after the first run. Subsequent runs use the cache (~30 seconds).

### Step 5 — View Results
After Section 8, the notebook outputs:
- Sentiment model comparison (Accuracy, F1, Confusion Matrix)
- Price prediction comparison (R², RMSE, Directional Accuracy)
- Feature importance charts
- BUY/HOLD/SELL signal charts with latest recommendation

---

## Important Notes

- **GPU recommended** for RoBERTa inference (Runtime → Change runtime type → T4 GPU)
- **Cache:** RoBERTa results are saved to `/content/sentiment_cache/`. Delete this folder if you change the news data.
- **Data files** must be placed in `/content/` or update file paths in Section 2.
- **Date range** is fixed to 2020-01-01 → 2026-05-10 in Section 4. Do not change without also updating news data.

---

## Key Results Summary

| Metric | AAPL | Gold |
|--------|------|------|
| Best Sentiment Model | Logistic Regression | Logistic Regression |
| Sentiment Accuracy | 75%+ | 81%+ |
| Best Price Model | XGBoost | XGBoost |
| Directional Accuracy | 61.19% | 57.31% |
| Sentiment Contribution | +5–6% vs no-sentiment baseline | — |

---
## How to Run the Website
1. Ensure you have a web browser installed (e.g., Chrome, Firefox).
2. Download the project repository as a ZIP file or clone it to your local machine.
3. Open the folder containing the web files(stock website).
4. Locate the `main.html` file and double-click it to open it directly in your browser.

## License
Academic use only — Umm Al-Qura University, 2025/2026.
