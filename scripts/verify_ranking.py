import argparse
import json
import math
from pathlib import Path

from score_materials import load_candidates, rank_candidates


DATASET = Path(__file__).resolve().parents[1] / "data" / "materials.csv"
CASES = {"baseline": 5, "cost3": 3}


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def reject_constant(value):
    raise ValueError(f"Non-finite JSON value: {value}")


def load_result(path):
    with Path(path).open(encoding="utf-8-sig") as handle:
        return json.load(
            handle, object_pairs_hook=unique_object, parse_constant=reject_constant
        )


def compare_json(expected, actual, path="$"):
    if isinstance(expected, dict):
        if not isinstance(actual, dict):
            raise ValueError(f"{path}: expected an object")
        missing = sorted(expected.keys() - actual.keys())
        extra = sorted(actual.keys() - expected.keys())
        if missing or extra:
            raise ValueError(f"{path}: missing keys {missing}; unexpected keys {extra}")
        for key, value in expected.items():
            compare_json(value, actual[key], f"{path}.{key}")
    elif isinstance(expected, list):
        if not isinstance(actual, list) or len(actual) != len(expected):
            raise ValueError(f"{path}: expected an array of length {len(expected)}")
        for index, (expected_item, actual_item) in enumerate(zip(expected, actual)):
            compare_json(expected_item, actual_item, f"{path}[{index}]")
    elif type(expected) in (int, float):
        if type(actual) not in (int, float):
            raise ValueError(f"{path}: expected a number, not {type(actual).__name__}")
        if isinstance(actual, float) and not math.isfinite(actual):
            raise ValueError(f"{path}: expected a finite number")
        if actual != expected:
            raise ValueError(f"{path}: expected {expected!r}, got {actual!r}")
    elif type(actual) is not type(expected) or actual != expected:
        raise ValueError(f"{path}: expected {expected!r}, got {actual!r}")


def verify_ranking(actual, case):
    if case not in CASES:
        raise ValueError(f"Unsupported case: {case}")
    expected = rank_candidates(load_candidates(DATASET), max_cost=CASES[case])
    compare_json(expected, actual)
    return {
        "content_verified": True,
        "case": case,
        "candidate_count": expected["candidate_count"],
        "eligible_count": expected["eligible_count"],
        "execution_verified": False,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Verify the raw synthetic ranking file, not its execution provenance"
    )
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--case", choices=CASES, required=True)
    args = parser.parse_args()
    try:
        summary = verify_ranking(load_result(args.input), args.case)
    except (OSError, ValueError) as error:
        parser.error(str(error))
    print(json.dumps(summary, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
