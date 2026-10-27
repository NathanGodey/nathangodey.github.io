#!/usr/bin/env python3
"""Pack the loss-levels samples into assets/loss-levels/ for the post's slider.

    python3 tools/build_loss_levels.py SAMPLES_DIR [--evals EVALS_DIR]

SAMPLES_DIR holds one <branch>.json per checkpoint of nthngdy/loss-levels-125M
(made by generate_loss_levels.py). Steps and losses come from the README table
on the model's `main` branch: `val loss` when filled in, else the trigger EMA.
EVALS_DIR holds one <branch>.json per checkpoint (made by eval_loss_levels.py) with the
held-out FineWeb-Edu (`fwe`) and FineWeb (`fw`) losses the chart can switch between.
Re-run it after new checkpoints are sampled or evaluated.

Writes index.json (stems + one row per checkpoint, in training order) and one
small <branch>.json per checkpoint, fetched on demand by the page.

Standard library only.
"""
import argparse
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "loss-levels"
README = "https://huggingface.co/nthngdy/loss-levels-125M/raw/main/README.md"
ROW = re.compile(r"^\|\s*`(loss-[\d.]+)`\s*\|\s*(\d+)\s*\|[^|]*\|\s*([\d.]+)\s*\|\s*([\d.]*)\s*\|")


def table():
    with urllib.request.urlopen(README, timeout=30) as r:
        text = r.read().decode()
    rows = {}
    for line in text.splitlines():
        m = ROW.match(line)
        if m:
            branch, step, ema, val = m.groups()
            rows[branch] = {"step": int(step), "ema": float(ema), "val": float(val) if val else None}
    return rows


def main():
    p = argparse.ArgumentParser()
    p.add_argument("samples", type=Path)
    p.add_argument("--evals", type=Path)
    a = p.parse_args()

    rows = table()
    files = sorted(a.samples.glob("loss-*.json"))
    ckpts, stems = [], None
    OUT.mkdir(parents=True, exist_ok=True)
    for f in files:
        d = json.load(open(f))
        br = d["branch"]
        if br not in rows:
            print(f"skip {br}: not in the README table yet", file=sys.stderr)
            continue
        s = [x["stem"] for x in d["stems"]]
        if stems is None:
            stems = s
        assert s == stems, f"{br}: different prompts"
        r = rows[br]
        ckpts.append({"branch": br, "step": r["step"],
                      "loss": r["val"] if r["val"] is not None else r["ema"],
                      "val": r["val"] is not None})
        ev = a.evals / f"{br}.json" if a.evals else None
        if ev and ev.exists():
            e = json.load(open(ev))
            ckpts[-1].update(fwe=round(e["fwe"]["loss"], 4), fw=round(e["fw"]["loss"], 4))
        json.dump({"u": [[x["text"], x["ended"]] for x in d["unconditional"]],
                   "s": [[x["text"], x["ended"]] for x in d["stems"]]},
                  open(OUT / f"{br}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    ckpts.sort(key=lambda c: c["step"])
    json.dump({"stems": stems, "n_uncond": len(d["unconditional"]), "ckpts": ckpts},
              open(OUT / "index.json", "w"), ensure_ascii=False, indent=1)
    n_val = sum(c["val"] for c in ckpts)
    n_ev = sum("fwe" in c for c in ckpts)
    print(f"{len(ckpts)} checkpoints -> {OUT.relative_to(ROOT)} ({n_val} with val loss, {n_ev} with FW/FWE evals)")


if __name__ == "__main__":
    main()
