# Run And Verify

This dashboard snapshot is no longer a standalone pipeline. It reads canonical data produced by the repo root pipeline.

## 1. Run The Canonical Pipeline

From the repository root:

```powershell
python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0
```

## 2. Start The Dashboard API

From this folder:

```powershell
cd C:\Users\Laptop\OneDrive\Desktop\Creative-client-\frontend\nexviatech-pipeline\dashboard\api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 3. Start The Dashboard Web App

```powershell
cd C:\Users\Laptop\OneDrive\Desktop\Creative-client-\frontend\nexviatech-pipeline\dashboard\web
npm run dev
```

## 4. Verify

- `http://localhost:8000/analytics` should return the root repo analytics data
- `http://localhost:8000/stats` should return totals derived from the canonical root pipeline artifacts
- `http://localhost:3000` should render the dashboard UI

## Migration Note

- `frontend/nexviatech-pipeline/run_pipeline.py` is deprecated.
- `frontend/nexviatech-pipeline/pipeline.py` is deprecated.
- Run the pipeline only from the repository root.
