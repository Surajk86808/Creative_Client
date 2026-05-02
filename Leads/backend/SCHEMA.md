# Schema Reference

This file documents the cross-folder data contracts used by the pipeline.

Some artifacts already contain additional legacy fields. The tables below focus on the normalized fields the pipeline depends on most often.

## 1. Lead JSON Output From `lead_finder/`

Typical location:

- `lead_finder/public/data/{country}/{city}/{category}/{category}.json`
- `lead_finder/public/data/{country}/{city}/{city}_leads.json`

| Field | Type | Notes |
| --- | --- | --- |
| `place_id` | `string \| null` | Google Maps place identifier when available. |
| `name` | `string` | Business display name. |
| `email` | `string \| null` | Preferred email address when one was extracted. |
| `primary_email` | `string \| null` | Canonical primary email used by downstream tools. |
| `phone` | `string \| null` | Raw business phone number. |
| `website` | `string \| null` | Source website URL discovered during scraping. |
| `category` | `string` | Business category or matched category bucket. |
| `city` | `string` | City name or city slug from the scrape context. |
| `country` | `string` | Country slug when present in the storage path. |
| `social_media_links` | `string[]` | Extracted social profile URLs. |
| `score` | `number \| null` | Qualification or website quality score when a normalized score is emitted. |
| `qualified` | `boolean` | Whether the lead passed qualification rules for outreach. |
| `priority` | `"high" \| "medium" \| "low"` | Priority bucket used before build gating. |
| `has_whatsapp` | `boolean` | Whether the lead has a WhatsApp-reachable number. |
| `has_email` | `boolean` | Whether the lead has at least one valid email. |
| `contact_eligible` | `boolean` | True when WhatsApp or email is available. |
| `build_eligible` | `boolean` | True when priority is high/medium and a contact channel exists. |
| `build_skip_reason` | `string \| null` | Why the lead was excluded from website generation. |

Current repo note:

- Existing exports also commonly include `lead_id`, `shop_name`, `location`, `emails`, `rating`, `review_count`, `lead_quality_score`, `outreach_suitability`, `website_status`, `website_score`, `website_issues`, `google_maps_url`, `status`, `created_at`, and `last_action_date`.
- Category folders now also emit `ineligible_leads.json` alongside `no_web_leads.json` and `weak_web_leads.json` so skipped leads still have an audit trail.

## 2. Analytics Entry In `analytics/index.json`

| Field | Type | Notes |
| --- | --- | --- |
| `city` | `string` | City slug for the batch. |
| `country` | `string` | Country slug for the batch. |
| `category` | `string` | Category slug for the batch. |
| `status` | `"scraped" \| "building" \| "built" \| "deployed" \| "error" \| "rejected"` | Current batch lifecycle state. |
| `scraped_at` | `string` | ISO timestamp written when lead_finder marks a batch as scraped. |
| `built_at` | `string \| null` | Normalized build completion time. In the current file this is represented by `build_completed_at`. |
| `deployed_at` | `string \| null` | Normalized deployment completion time. The current tracker derives deployment state from `deployed_count` instead of storing a dedicated timestamp. |
| `error` | `string \| null` | Latest error message. In the current file this is represented by `last_error`. |

Current repo note:

- Actual analytics entries also include `key`, `lead_count`, `leads_file`, `build_started_at`, `build_completed_at`, `built_count`, `deployed_count`, `error_count`, `last_error_at`, and `last_error`.

## 3. `leads.xlsx` Columns

Typical location:

- `output/{country}/{city}/{category}/leads.xlsx`

| Column | Type | Notes |
| --- | --- | --- |
| `build_status` | `string` | Build or deploy state for the generated site row. |
| `review_status` | `"pending" \| "approved" \| "rejected" \| ""` | Human review decision synchronized from `_lead_meta.json`. |
| `whatsapp` | `"YES" \| "NO" \| "INVALID" \| "ERROR" \| ""` | Result written by `whatsappcheck/`. |
| `email` | `string` | Contact email used by `email_sender/`. |
| `phone` | `string` | Contact phone used by `whatsappcheck/`. |
| `name` | `string` | Business name. |
| `website` | `string \| null` | Original source website when carried through export. |
| `city` | `string` | City value used for grouping and reporting. |
| `category` | `string` | Category value used for grouping and reporting. |
| `deployed_url` | `string \| null` | Final generated website URL when deployed. The current exporter stores this under `generated_website`. |

Current repo note:

- The current workbook also includes `shop_id`, `source_website`, `generated_website`, `instagram`, `facebook`, `linkedin`, `twitter`, `social_media_links`, `google_maps_url`, `country`, `review_notes`, `preview_path`, `template_used`, and `deployed_at`.

## 4. `_lead_meta.json` Fields

Typical location:

- `output/{country}/{city}/{category}/{shop_id}/_lead_meta.json`

| Field | Type | Notes |
| --- | --- | --- |
| `review_status` | `"pending" \| "approved" \| "rejected"` | Canonical review decision for the generated site. |
| `approved_at` | `string \| null` | Timestamp that can be recorded when a site is approved. |
| `rejected_at` | `string \| null` | Timestamp that can be recorded when a site is rejected. |
| `reviewer_note` | `string` | Free-form reviewer feedback. The current repo stores this as `review_notes`. |

Current repo note:

- Existing `_lead_meta.json` files also include business identity and preview fields such as `shop_id`, `shop_name`, `category`, `city`, `country`, `address`, `phone`, `email`, social links, `google_maps_url`, `rating`, `reviews_count`, `website_url`, `preview_path`, `review_status`, `review_notes`, `review_updated_at`, and `generated_at`.

## 5. Email Status Log Fields

Primary status files are stored under:

- `public/email_status/{campaign}.json`
- `public/email_status/{campaign}_smtp_events.jsonl`
- `public/email_status/{campaign}_audit_log.json`

### 5.1 Per-Lead Status Map: `{campaign}.json`

| Field | Type | Notes |
| --- | --- | --- |
| `email_sent` | `boolean` | True when the latest attempt succeeded. |
| `attempted_at` | `string \| null` | ISO timestamp of the latest attempt. |
| `sent_at` | `string \| null` | ISO timestamp of the latest successful send. |
| `subject` | `string` | Subject used on the latest attempt. |
| `status` | `"SENT" \| "FAILED"` | Result of the latest attempt. |
| `failed_attempts` | `number` | Consecutive failed attempt count. |

### 5.2 SMTP Event Row: `{campaign}_smtp_events.jsonl`

| Field | Type | Notes |
| --- | --- | --- |
| `message_id` | `string` | Generated email message id. |
| `provider_response` | `string` | SMTP provider response or refusal payload. |
| `timestamp` | `string` | ISO timestamp of the SMTP event. |
| `recipient` | `string` | Normalized recipient email. |
| `subject` | `string` | Final email subject. |

### 5.3 Audit Log Row: `{campaign}_audit_log.json`

| Field | Type | Notes |
| --- | --- | --- |
| `lead_id` | `string` | Lead identifier used by the email sender. |
| `normalized_email` | `string` | Lowercased destination address. |
| `bucket_no` | `string` | Bucket number selected from shared template config. |
| `scenario` | `string` | Template scenario selected for the lead. |
| `subject` | `string` | Final generated subject line. |
| `message_id` | `string` | Generated email message id. |
| `provider_response` | `string` | SMTP provider response or error text. |
| `status` | `"SENT" \| "FAILED"` | Final attempt status. |
| `timestamp` | `string` | ISO timestamp of the audit row. |
| `whatsapp` | `string` | WhatsApp status copied from the lead when available. |
