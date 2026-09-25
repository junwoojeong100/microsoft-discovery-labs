import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from score_materials import load_candidates, rank_candidates
from verify_ranking import load_result, verify_ranking


class ResultVerificationTests(unittest.TestCase):
    def setUp(self):
        self.rows = load_candidates(ROOT / "data" / "materials.csv")
        self.baseline = rank_candidates(self.rows)
        self.cost3 = rank_candidates(self.rows, max_cost=3)

    def test_both_cases_match_without_claiming_cloud_execution(self):
        for case, result, count in (
            ("baseline", self.baseline, 3),
            ("cost3", self.cost3, 1),
        ):
            with self.subTest(case=case):
                summary = verify_ranking(result, case)
                self.assertTrue(summary["content_verified"])
                self.assertFalse(summary["execution_verified"])
                self.assertEqual(summary["eligible_count"], count)

    def test_wrong_case_rejected(self):
        with self.assertRaises(ValueError):
            verify_ranking(self.baseline, "cost3")
        with self.assertRaises(ValueError):
            verify_ranking(self.baseline, "unsupported")

    def test_wrong_score_or_order_rejected(self):
        for mutation in ("score", "order"):
            result = copy.deepcopy(self.baseline)
            if mutation == "score":
                result["ranking"][0]["score"] = 99
            else:
                result["ranking"].reverse()
            with self.subTest(mutation=mutation), self.assertRaises(ValueError):
                verify_ranking(result, "baseline")

    def test_missing_duplicate_or_changed_candidate_rejected(self):
        for mutation in ("missing", "duplicate", "status", "evidence"):
            result = copy.deepcopy(self.baseline)
            if mutation == "missing":
                result["decisions"].pop()
            elif mutation == "duplicate":
                result["decisions"][1] = copy.deepcopy(result["decisions"][0])
            else:
                zeta = next(row for row in result["decisions"] if row["candidate_id"] == "ZETA")
                if mutation == "status":
                    zeta["status"] = "eligible"
                else:
                    zeta["missing_evidence"] = []
            with self.subTest(mutation=mutation), self.assertRaises(ValueError):
                verify_ranking(result, "baseline")

    def test_schema_and_metadata_rejected_when_incomplete_or_unexpected(self):
        for mutation in ("missing", "extra", "version"):
            result = copy.deepcopy(self.baseline)
            if mutation == "missing":
                del result["constraints"]
            elif mutation == "extra":
                result["cloud_verified"] = True
            else:
                result["schema_version"] = "2.0"
            with self.subTest(mutation=mutation), self.assertRaises(ValueError):
                verify_ranking(result, "baseline")

    def test_booleans_are_not_numbers(self):
        result = copy.deepcopy(self.cost3)
        result["eligible_count"] = True
        with self.assertRaisesRegex(ValueError, "expected a number"):
            verify_ranking(result, "cost3")
        result = copy.deepcopy(self.baseline)
        result["synthetic_data"] = 1
        with self.assertRaises(ValueError):
            verify_ranking(result, "baseline")

    def test_nonfinite_scores_rejected(self):
        for value in (float("nan"), float("inf"), -float("inf")):
            result = copy.deepcopy(self.baseline)
            result["ranking"][0]["score"] = value
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, "finite"):
                verify_ranking(result, "baseline")

    def test_json_rejects_duplicate_keys_and_nonstandard_constants(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "result.json"
            for text in ('{"a":1,"a":2}', '{"a":NaN}', '{"a":Infinity}', '{broken'):
                path.write_text(text, encoding="utf-8")
                with self.subTest(text=text), self.assertRaises(ValueError):
                    load_result(path)

    def test_source_column_and_missing_evidence_label_are_distinct(self):
        zeta = next(row for row in self.rows if row["candidate_id"] == "ZETA")
        self.assertEqual(zeta["corrosion_status"], "unknown")
        self.assertNotIn("corrosion_result", zeta)
        revised = next(row for row in self.cost3["decisions"] if row["candidate_id"] == "ZETA")
        self.assertEqual(revised["status"], "excluded")
        self.assertEqual(revised["missing_evidence"], ["corrosion_result"])

    def test_cli_fails_explicitly_without_success_output(self):
        command = [sys.executable, str(ROOT / "scripts" / "verify_ranking.py")]
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "result.json"
            path.write_text(json.dumps(self.baseline), encoding="utf-8")
            passed = subprocess.run(
                command + ["--input", str(path), "--case", "baseline"],
                capture_output=True, text=True, check=False,
            )
            self.assertEqual(passed.returncode, 0, passed.stderr)
            self.assertFalse(json.loads(passed.stdout)["execution_verified"])
            failed = subprocess.run(
                command + ["--input", str(path), "--case", "cost3"],
                capture_output=True, text=True, check=False,
            )
            self.assertNotEqual(failed.returncode, 0)
            self.assertIn("error:", failed.stderr)
            self.assertEqual(failed.stdout, "")
            missing = subprocess.run(
                command + ["--input", str(path.with_name("missing.json")), "--case", "baseline"],
                capture_output=True, text=True, check=False,
            )
            self.assertNotEqual(missing.returncode, 0)
            self.assertEqual(missing.stdout, "")


if __name__ == "__main__":
    unittest.main()
