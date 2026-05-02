# Screenshot Taker

`screenshot-taker/` is the canonical screenshot stage for the monorepo.

## Supported Command

```powershell
python screenshot-taker/run.py
```

In normal operation this stage is invoked by the root pipeline:

```powershell
python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0
```

## Responsibility

- Scan `output/**/leads.xlsx`
- Capture screenshots for approved/good website rows
- Write `screenshot_path` back into the workbook

## Migration Note

Older combined screenshot mailer flows are deprecated. Screenshot capture now lives here, while outreach remains in `email_sender/`.
