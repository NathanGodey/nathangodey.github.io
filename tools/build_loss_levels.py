#!/usr/bin/env python3
"""Pack the loss-levels samples into assets/loss-levels/ for the post's slider.

    python3 tools/build_loss_levels.py SAMPLES_DIR [--evals EVALS_DIR] [--decodes ROOT] [--judge JUDGE_DIR]

SAMPLES_DIR holds one <branch>.json per checkpoint of nthngdy/loss-levels-125M
(made by generate_loss_levels.py). Steps and losses come from the README table
on the model's `main` branch: `val loss` when filled in, else the trigger EMA.
EVALS_DIR holds one <branch>.json per checkpoint (made by eval_loss_levels.py) with the
held-out FineWeb-Edu (`fwe`) and FineWeb (`fw`) losses the chart can switch between.
ROOT holds samples_<mode>/ folders of the same <branch>.json files made with other decodings
(generate_loss_levels.py --decode <mode>; greedy modes have one unconditional row). Each mode
found becomes an entry of the page's Decoding menu (DECODES below).
JUDGE_DIR holds <samples folder>/<branch>.json (made by judge_samples.py) with a 1-10 score per sample
in the same order; each sample row becomes [text, ended, score] (score null if missing).
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
# (row key prefix, folder suffix, menu label); the main samples use prefix "".
# DEFAULT is the decoding the page opens on (it falls back to pure sampling if not found).
DEFAULT = "q"
DECODES = [("q", "top_p_rep", "Top-p 0.9, temperature 0.7, repetition penalty 1.1"),
           ("g", "greedy", "Greedy"),
           ("r", "greedy_rep", "Greedy, repetition penalty 1.1"),
           ("p", "top_p", "Top-p 0.9, temperature 0.7")]
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
    p.add_argument("--decodes", type=Path)
    p.add_argument("--judge", type=Path)
    a = p.parse_args()

    def judged(folder, br):
        f = a.judge / folder / f"{br}.json" if a.judge else None
        return json.load(open(f)) if f and f.exists() else None

    def packed(xs, j, kind):
        sc = j[kind] if j else [None] * len(xs)
        assert len(sc) == len(xs), "judge scores don't match the samples"
        return [[x["text"], x["ended"], s] for x, s in zip(xs, sc)]

    rows = table()
    files = sorted(a.samples.glob("loss-*.json"))
    ckpts, stems, n_dec = [], None, {}
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
        samples = {"u": packed(d["unconditional"], judged(a.samples.name, br), "u"),
                   "s": packed(d["stems"], judged(a.samples.name, br), "s")}
        for key, name, _ in DECODES if a.decodes else []:
            f2 = a.decodes / f"samples_{name}" / f"{br}.json"
            if f2.exists():
                d2 = json.load(open(f2))
                assert [x["stem"] for x in d2["stems"]] == stems, f"{br}: {name} prompts differ"
                samples[key + "u"] = packed(d2["unconditional"], judged(f"samples_{name}", br), "u")
                samples[key + "s"] = packed(d2["stems"], judged(f"samples_{name}", br), "s")
                n_dec[key] = max(n_dec.get(key, 0), len(d2["unconditional"]))
        json.dump(samples, open(OUT / f"{br}.json", "w"), ensure_ascii=False, separators=(",", ":"))
    ckpts.sort(key=lambda c: c["step"])
    decodings = [{"key": "", "label": "Sampling (temperature 1)", "n_uncond": len(d["unconditional"])}] + [
        {"key": k, "label": lab, "n_uncond": n_dec[k]} for k, _, lab in DECODES if k in n_dec]
    json.dump({"stems": stems, "n_uncond": len(d["unconditional"]), "decodings": decodings,
               "default": DEFAULT if DEFAULT in n_dec else "", "ckpts": ckpts},
              open(OUT / "index.json", "w"), ensure_ascii=False, indent=1)
    n_val = sum(c["val"] for c in ckpts)
    n_ev = sum("fwe" in c for c in ckpts)
    print(f"{len(ckpts)} checkpoints -> {OUT.relative_to(ROOT)} "
          f"({n_val} with val loss, {n_ev} with FW/FWE evals; decodings: {[x['label'] for x in decodings]})")


if __name__ == "__main__":
    main()
