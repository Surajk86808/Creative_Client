from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from email_sender.agent import (
    normalize_email,
    render_template,
    resolve_bucket_and_scenario,
    select_template,
)
from email_sender.guardrails import validate_generated_email
from email_sender.validation import validate_template_files


class EmailSystemTests(unittest.TestCase):
    def test_category_to_bucket_mapping(self) -> None:
        category_bucket_doc = {
            "meta": {},
            "templates": {},
            "bucket_no": {"home_services": 2},
            "categories": {"home_services": ["home cleaning", "pest control"]},
            "scenarios": {"home_services": "default"},
        }
        bucket, scenario, bucket_no = resolve_bucket_and_scenario(
            "home cleaning",
            category_bucket_doc,
        )
        self.assertEqual(bucket, "home_services")
        self.assertEqual(scenario, "default")
        self.assertEqual(bucket_no, "2")

    def test_bucket_to_scenario_template_mapping(self) -> None:
        template_doc = {
            "meta": {},
            "templates": {"home_services": {"default": "Hello {{business_name}}"}},
            "bucket_no": {},
            "categories": {},
            "scenarios": {},
        }
        self.assertEqual(
            select_template("home_services", "default", template_doc),
            "Hello {{business_name}}",
        )

    def test_array_template_schema_is_normalized(self) -> None:
        category_bucket = {
            "buckets": [
                {
                    "bucket_no": 4,
                    "bucket_name": "Food & Hospitality",
                    "categories": ["hotel", "restaurant"],
                }
            ]
        }
        bucket_templates = {
            "meta": {},
            "templates": [
                {
                    "bucket_no": 4,
                    "bucket_name": "Food & Hospitality",
                    "categories": ["hotel", "restaurant"],
                    "scenarios": {
                        "no_website": {
                            "subject": "{{business_name}} needs a stronger website",
                            "body": "Hi {{business_name}},\n\nWe can help in {{city}}.",
                        }
                    },
                }
            ],
        }

        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            category_path = tmp_path / "category_bucket.json"
            template_path = tmp_path / "bucket_email_template.json"
            category_path.write_text(json.dumps(category_bucket), encoding="utf-8")
            template_path.write_text(json.dumps(bucket_templates), encoding="utf-8")

            category_doc, template_doc = validate_template_files(category_path, template_path)

        bucket, scenario, bucket_no = resolve_bucket_and_scenario("hotel", category_doc)
        self.assertEqual(bucket, "bucket_4")
        self.assertEqual(scenario, "no_website")
        self.assertEqual(bucket_no, "4")

        template_text = select_template(bucket, scenario, template_doc)
        self.assertIn("Subject guidance:", template_text)
        self.assertIn("Body guidance:", template_text)
        self.assertIn("{{business_name}}", template_text)

    def test_template_variable_replacement(self) -> None:
        template = "Hi {{business_name}} in {{city}}"
        rendered = render_template(template, {"business_name": "Quick4u", "city": "Bengaluru"})
        self.assertEqual(rendered, "Hi Quick4u in Bengaluru")

    def test_dedup_logic_key(self) -> None:
        campaign_id = "bengaluru-1"
        email = normalize_email("  Test@Email.com ")
        dedup_key = f"{campaign_id}::{email}"
        self.assertEqual(dedup_key, "bengaluru-1::test@email.com")

    def test_guardrail_validation(self) -> None:
        signature = "Website: https://nexviatech.online\nMobile: 6299846516\nSuraj Yadav"
        subject = "Growth Plan for Quick4u"
        body = (
            "Hi Quick4u Team,\n\n"
            "You are getting strong local attention in Bengaluru and there is room to convert more of that demand.\n\n"
            "- Improve search visibility for high-intent local queries\n"
            "- Increase conversion with service-specific landing pages\n"
            "- Reduce lead leakage with faster response workflows\n\n"
            "Open to a short 10-minute call this week?\n\n"
            f"{signature}"
        )
        is_valid, reason = validate_generated_email(subject, body, signature)
        self.assertTrue(is_valid, reason)

    def test_invalid_email_rejected(self):
        from email_sender.agent import _is_valid_email
        self.assertFalse(_is_valid_email("notanemail"))
        self.assertFalse(_is_valid_email("missing@"))
        self.assertFalse(_is_valid_email("@nodomain.com"))
        self.assertFalse(_is_valid_email("double..dot@domain.com"))
        self.assertTrue(_is_valid_email("valid@example.com"))
        self.assertTrue(_is_valid_email("user+tag@sub.domain.org"))

    def test_guardrail_rejects_missing_signature(self):
        from email_sender.guardrails import validate_generated_email
        signature = "Website: https://example.com\nMobile: 9999999999\nTest User"
        subject = "Hello"
        body = "This body has no signature block at all."
        valid, reason = validate_generated_email(subject, body, signature)
        self.assertFalse(valid)
        self.assertIn("Signature", reason)

    def test_guardrail_rejects_banned_phrase(self):
        from email_sender.guardrails import validate_generated_email
        signature = "Website: https://example.com\nMobile: 9999999999\nTest User"
        subject = "Boost your digital transformation today"
        body = f"We can help with digital transformation for your business.\n\n{signature}"
        valid, reason = validate_generated_email(subject, body, signature)
        self.assertFalse(valid)

    def test_guardrail_rejects_unreplaced_variables(self):
        from email_sender.guardrails import validate_generated_email
        signature = "Website: https://example.com\nMobile: 9999999999\nTest User"
        subject = "Hello {{SHOP_NAME}}"
        body = f"Dear customer.\n\n{signature}"
        valid, reason = validate_generated_email(subject, body, signature)
        self.assertFalse(valid)

    def test_rate_limiter_hourly_cap(self):
        import tempfile, json
        from pathlib import Path
        from email_sender.rate_limiter import RateLimiter
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
            state_path = Path(f.name)
        try:
            limiter = RateLimiter(max_per_hour=2, max_per_day=100,
                                  state_file=state_path)
            can, _ = limiter.can_send(); self.assertTrue(can)
            limiter.record_send()
            can, _ = limiter.can_send(); self.assertTrue(can)
            limiter.record_send()
            can, reason = limiter.can_send()
            self.assertFalse(can)
            self.assertIn("Hourly", reason)
        finally:
            state_path.unlink(missing_ok=True)

    def test_dry_run_no_groq_falls_back_to_lead_finder_public_data(self) -> None:
        from email_sender import agent

        with tempfile.TemporaryDirectory() as tmp_dir:
            repo_root = Path(tmp_dir)
            lead_dir = repo_root / "lead_finder" / "public" / "data" / "india" / "bengaluru"
            lead_dir.mkdir(parents=True, exist_ok=True)
            (lead_dir / "bengaluru_leads.json").write_text(
                json.dumps(
                    [
                        {
                            "lead_id": "LEAD_BLR_001",
                            "shop_name": "Botanical Studio",
                            "location": "Bengaluru",
                            "city": "Bengaluru",
                            "category": "salon",
                            "website_status": "none",
                            "primary_email": "hello@botanical.example",
                            "emails": ["hello@botanical.example"],
                        }
                    ]
                ),
                encoding="utf-8",
            )

            with mock.patch.object(agent, "REPO_ROOT", repo_root), mock.patch.object(
                agent, "LEAD_FINDER_PUBLIC_DIR", repo_root / "lead_finder" / "public"
            ), mock.patch.object(agent, "EMAIL_PUBLIC_DIR", repo_root / "public"), mock.patch.object(
                agent, "OUTPUT_DIR", repo_root / "output"
            ), mock.patch.object(
                sys, "argv", ["agent.py", "bengaluru", "--dry-run", "--dry-run-no-groq"]
            ):
                with self.assertLogs("email_sender", level="INFO") as captured:
                    agent.main()

            joined = "\n".join(captured.output)
            self.assertIn("Falling back to JSON leads.", joined)
            self.assertIn("[DRY-RUN-NO-GROQ] lead_id=LEAD_BLR_001 email=hello@botanical.example", joined)


if __name__ == "__main__":
    unittest.main()
