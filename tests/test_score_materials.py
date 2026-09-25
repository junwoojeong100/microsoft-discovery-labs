import copy
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from score_materials import load_candidates, rank_candidates


class RankingTests(unittest.TestCase):
    def setUp(self):
        self.rows = load_candidates(ROOT / "data" / "materials.csv")

    def test_exact_baseline(self):
        result = rank_candidates(self.rows)
        self.assertEqual(result["candidate_count"], 8)
        self.assertEqual(result["eligible_count"], 3)
        self.assertEqual(
            [(row["candidate_id"], row["score"]) for row in result["ranking"]],
            [("DELTA", 68.6), ("ALPHA", 67.8), ("THETA", 60.8)],
        )

    def test_revision_and_unknown_evidence(self):
        rows = {row["candidate_id"]: row for row in rank_candidates(self.rows)["decisions"]}
        self.assertEqual(rows["GAMMA"]["status"], "excluded")
        self.assertIn("conductivity_below_180", rows["GAMMA"]["failed_constraints"])
        self.assertIn("REV-001", rows["GAMMA"]["source_ids"])
        self.assertEqual(rows["ZETA"]["status"], "needs_review")
        self.assertIsNone(rows["ZETA"]["score"])

    def test_human_feedback_cost_ceiling(self):
        result = rank_candidates(self.rows, max_cost=3)
        self.assertEqual(
            [(row["candidate_id"], row["score"]) for row in result["ranking"]],
            [("DELTA", 68.6)],
        )
        self.assertEqual(result["cost_score_denominator"], 5)

    def test_reject_invalid_numeric_input(self):
        for bad in ("NaN", "Infinity", "-1"):
            with self.subTest(value=bad):
                rows = copy.deepcopy(self.rows)
                rows[0]["conductivity_w_mk"] = bad
                with self.assertRaises(ValueError):
                    rank_candidates(rows)

    def test_reject_invalid_limits_and_duplicates(self):
        for limit in (0, -1, "NaN", "Infinity"):
            with self.subTest(limit=limit), self.assertRaises(ValueError):
                rank_candidates(self.rows, max_cost=limit)
        with self.assertRaises(ValueError):
            rank_candidates(self.rows + [self.rows[0]])
        with self.assertRaises(ValueError):
            rank_candidates([])

    def test_exact_constraint_boundaries(self):
        rows = copy.deepcopy(self.rows[:1])
        rows[0].update(
            conductivity_w_mk="180", density_g_cm3="3", cost_usd_kg="5", recycled_pct="50"
        )
        self.assertEqual(rank_candidates(rows)["eligible_count"], 1)

    def test_invalid_corrosion_and_percentage(self):
        for field, value in (("corrosion_status", "maybe"), ("recycled_pct", "101")):
            rows = copy.deepcopy(self.rows)
            rows[0][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                rank_candidates(rows)


if __name__ == "__main__":
    unittest.main()
