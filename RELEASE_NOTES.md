# Release Notes

## v2.0

### Overview

Version `2.0` introduces the auto web-builder as a first-class part of the pipeline. This release moves the project closer to a true end-to-end automated flow by connecting lead processing directly to website generation in the canonical backend workflow.

Instead of treating website creation as a separate manual step, the pipeline now supports automatic website generation as part of the staged execution path. This makes the system more consistent for operators, reduces handoff friction between scrape and build stages, and improves repeatability when running the workflow for multiple cities and categories.

### What Was Added

- Added auto web-builder support to the main pipeline flow.
- Integrated website generation into the canonical backend orchestration path.
- Improved alignment between root commands and the actual backend stage structure.
- Established the web-builder as part of the standard operator workflow rather than a side path.

### Workflow Impact

With `v2.0`, the pipeline is better structured around a continuous progression:

1. Lead discovery and qualification
2. Automatic website generation
3. Website review and validation
4. Screenshot capture
5. WhatsApp enrichment
6. Outreach email preparation and sending

This change reduces the need for operators to manually jump between modules after the scrape phase. It also makes it easier to reason about the output directory, because generated site artifacts and batch workbooks now fit more naturally into the expected backend execution flow.

### Why This Matters

The addition of auto web-builder improves the project in a few important ways:

- Reduces manual orchestration effort during multi-stage runs
- Makes the pipeline easier to document and operate consistently
- Creates a clearer path from lead data to site output
- Helps standardize review, screenshot, and outreach stages around generated website artifacts
- Lowers the risk of stage drift caused by separate manual build execution

### Operator Notes

- The recommended entrypoint remains the root command:

```powershell
python run_pipeline.py --city "<city_name>" --categories-file categories.txt --max 0
```

- The root wrapper delegates to the canonical backend pipeline under `Leads/backend/`.
- Website generation is now treated as a normal stage in the backend runtime flow.
- Operators can still use dry-run and skip flags where needed for safer testing and staged execution.

### Expected Behavior Changes

After upgrading to `v2.0`, operators should expect:

- Website generation to appear as a more central part of normal pipeline execution
- Cleaner stage sequencing between lead finding and downstream review steps
- Better consistency in how generated outputs are written and handled
- Fewer workflow gaps between scraped leads and website-ready batches

### Scope of This Release

This release is primarily focused on workflow integration and operational structure rather than a visual redesign or a provider swap. The biggest value in `v2.0` is that the project behaves more like a unified automation pipeline instead of a loose collection of tools.
