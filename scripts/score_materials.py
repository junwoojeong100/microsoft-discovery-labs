import argparse
import csv
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path


NUMERIC_FIELDS = (
    "conductivity_w_mk",
    "density_g_cm3",
    "cost_usd_kg",
    "recycled_pct",
)
FIELDS = ("candidate_id", *NUMERIC_FIELDS, "corrosion_status", "source_ids")


def load_candidates(path):
    with Path(path).open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames != list(FIELDS):
            raise ValueError(f"CSV columns must be exactly {list(FIELDS)}")
        rows = list(reader)
    if not rows:
        raise ValueError("The candidate dataset is empty")
    return rows


def rank_candidates(rows, max_cost=Decimal("5")):
    max_cost = Decimal(str(max_cost))
    if not max_cost.is_finite() or max_cost <= 0:
        raise ValueError("max_cost must be finite and greater than zero")
    if not rows:
        raise ValueError("The candidate dataset is empty")

    seen = set()
    decisions = []
    for row in rows:
        identifier = row.get("candidate_id")
        if not identifier or identifier in seen:
            raise ValueError(f"Missing or duplicate candidate ID: {identifier!r}")
        seen.add(identifier)
        values = {}
        for field in NUMERIC_FIELDS:
            value = Decimal(str(row.get(field, "")))
            if not value.is_finite() or value < 0:
                raise ValueError(f"{identifier}: {field} must be finite and nonnegative")
            values[field] = value
        if values["recycled_pct"] > 100:
            raise ValueError(f"{identifier}: recycled_pct must not exceed 100")
        corrosion = row.get("corrosion_status")
        if corrosion not in {"pass", "fail", "unknown"}:
            raise ValueError(f"{identifier}: invalid corrosion_status")
        if not row.get("source_ids"):
            raise ValueError(f"{identifier}: source_ids are required")

        failed = []
        if values["conductivity_w_mk"] < 180:
            failed.append("conductivity_below_180")
        if values["density_g_cm3"] > 3:
            failed.append("density_above_3")
        if values["cost_usd_kg"] > max_cost:
            failed.append("cost_above_ceiling")
        if values["recycled_pct"] < 50:
            failed.append("recycled_content_below_50")
        if corrosion == "fail":
            failed.append("corrosion_failed")
        missing = ["corrosion_result"] if corrosion == "unknown" else []
        status = "excluded" if failed else "needs_review" if missing else "eligible"
        score = None
        if status == "eligible":
            score = (
                50 * min(values["conductivity_w_mk"] / 250, Decimal(1))
                + 30 * max(Decimal(0), 1 - values["cost_usd_kg"] / 5)
                + 20 * min(values["recycled_pct"] / 100, Decimal(1))
            )
            score = float(score.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP))
        decisions.append(
            {
                "candidate_id": identifier,
                "status": status,
                "score": score,
                "failed_constraints": failed,
                "missing_evidence": missing,
                "source_ids": row["source_ids"].split(";"),
            }
        )
    eligible = sorted(
        (item for item in decisions if item["status"] == "eligible"),
        key=lambda item: (-item["score"], item["candidate_id"]),
    )
    return {
        "schema_version": "1.0",
        "synthetic_data": True,
        "method": "Deterministic reference calculation; execution location is not attested",
        "constraints": {
            "min_conductivity_w_mk": 180,
            "max_density_g_cm3": 3,
            "max_cost_usd_kg": float(max_cost),
            "min_recycled_pct": 50,
            "required_corrosion_status": "pass",
        },
        "cost_score_denominator": 5,
        "candidate_count": len(decisions),
        "eligible_count": len(eligible),
        "ranking": eligible,
        "decisions": decisions,
    }


def main():
    parser = argparse.ArgumentParser(description="Rank fictional heat-sink materials")
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--max-cost", type=Decimal, default=Decimal("5"))
    args = parser.parse_args()
    result = rank_candidates(load_candidates(args.input), args.max_cost)
    text = json.dumps(result, indent=2, allow_nan=False) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    else:
        print(text, end="")


if __name__ == "__main__":
    main()
