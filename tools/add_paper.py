#!/usr/bin/env python3
"""Draft a publications.yml entry (and a news item) from an arXiv ID.

    python3 tools/add_paper.py 2610.19247            # prints the drafts
    python3 tools/add_paper.py 2610.19247 --write    # inserts them at the top of the data files
    python3 tools/add_paper.py thumb 2610.19247 cplm PAGE X Y W H
        # crops a figure into img/thumbnails/cplm_thumb.jpg; coordinates are in points
        # (72 per inch) from the top-left of the page. Needs poppler (pdftoppm).

Standard library only. Review the draft before committing: venue, author marks
(* / †), links and the `featured` rank are left for a human or agent to decide.
"""
import argparse
import re
import subprocess
import sys
import tempfile
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ATOM = "{http://www.w3.org/2005/Atom}"
ARXIV = "{http://arxiv.org/schemas/atom}"


def fetch(arxiv_id):
    url = f"https://export.arxiv.org/api/query?id_list={arxiv_id}"
    with urllib.request.urlopen(url, timeout=30) as r:
        entry = ET.fromstring(r.read()).find(f"{ATOM}entry")
    if entry is None or entry.find(f"{ATOM}title") is None:
        sys.exit(f"arXiv ID not found: {arxiv_id}")
    clean = lambda s: " ".join(s.split())
    cat = entry.find(f"{ARXIV}primary_category")
    return {
        "title": clean(entry.find(f"{ATOM}title").text),
        "abstract": clean(entry.find(f"{ATOM}summary").text),
        "authors": [clean(a.find(f"{ATOM}name").text) for a in entry.findall(f"{ATOM}author")],
        "date": entry.find(f"{ATOM}published").text[:10],
        "category": cat.get("term") if cat is not None else "cs.CL",
    }


def slug(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def q(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def draft(arxiv_id, meta):
    year = meta["date"][:4]
    first_word = slug(meta["title"]).split("-")[0]
    last_name = slug(meta["authors"][0].split()[-1])
    pid = "-".join(slug(meta["title"]).split("-")[:4])
    bib = "\n".join([
        f"@misc{{{last_name}{year}{first_word},",
        f"      title={{{meta['title']}}},",
        f"      author={{{' and '.join(meta['authors'])}}},",
        f"      year={{{year}}},",
        f"      eprint={{{arxiv_id}}},",
        "      archivePrefix={arXiv},",
        f"      primaryClass={{{meta['category']}}}",
        "}",
    ])
    entry = "\n".join([
        f"- id: {pid}",
        f"  title: {q(meta['title'])}",
        "  authors: [" + ", ".join(q(a) for a in meta["authors"]) + "]",
        '  venue: "Preprint"',
        f"  year: {year}",
        f"  date: {meta['date']}",
        f"  # image: /img/thumbnails/{pid}_thumb.jpeg",
        "  links:",
        f"    arxiv: https://arxiv.org/abs/{arxiv_id}",
        '  tldr: ""  # TODO: one sentence for the home page',
        f"  abstract: {q(meta['abstract'])}",
        "  bibtex: |-",
        *("    " + line for line in bib.split("\n")),
        "",
    ])
    news = "\n".join([
        f"- date: {meta['date']}",
        f"  text: {q('New preprint: [' + meta['title'] + '](https://arxiv.org/abs/' + arxiv_id + ').')}",
    ])
    return pid, entry, news


def insert_top(path, block):
    """Insert a YAML list item before the first existing item, keeping header comments."""
    text = path.read_text()
    i = text.find("\n- ") + 1 if not text.startswith("- ") else 0
    path.write_text(text[:i] + block.rstrip("\n") + "\n" + ("\n" if path.name == "publications.yml" else "") + text[i:])


def thumb(arxiv_id, pid, page, x, y, w, h):
    dpi = 240
    s = dpi / 72
    target = ROOT / "img" / "thumbnails" / f"{pid}_thumb"
    with tempfile.TemporaryDirectory() as tmp:
        pdf = Path(tmp) / "paper.pdf"
        urllib.request.urlretrieve(f"https://arxiv.org/pdf/{arxiv_id}", pdf)
        subprocess.run([
            "pdftoppm", "-r", str(dpi), "-f", str(page), "-l", str(page), "-singlefile",
            "-x", str(int(x * s)), "-y", str(int(y * s)), "-W", str(int(w * s)), "-H", str(int(h * s)),
            "-jpeg", "-jpegopt", "quality=92", str(pdf), str(target),
        ], check=True)
    print(f"wrote {target.relative_to(ROOT)}.jpg — set `image: /{target.relative_to(ROOT)}.jpg` in publications.yml")


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "thumb":
        p = argparse.ArgumentParser()
        p.add_argument("cmd")
        p.add_argument("arxiv_id")
        p.add_argument("id", help="publication id, used for the file name")
        for k in ("page", "x", "y", "w", "h"):
            p.add_argument(k, type=float)
        a = p.parse_args()
        return thumb(a.arxiv_id, a.id, int(a.page), a.x, a.y, a.w, a.h)

    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("arxiv_id")
    p.add_argument("--write", action="store_true", help="insert into _data/publications.yml and _data/news.yml")
    a = p.parse_args()
    arxiv_id = re.sub(r"v\d+$", "", a.arxiv_id.split("/")[-1])

    pubs = ROOT / "_data" / "publications.yml"
    if f"arxiv.org/abs/{arxiv_id}" in pubs.read_text():
        sys.exit(f"{arxiv_id} is already in publications.yml")

    pid, entry, news = draft(arxiv_id, fetch(arxiv_id))
    if a.write:
        insert_top(pubs, entry)
        insert_top(ROOT / "_data" / "news.yml", news)
        print(f"Added '{pid}' to publications.yml and a news item. Fill in the TODOs.")
    else:
        print("# publications.yml\n" + entry + "\n# news.yml\n" + news)


if __name__ == "__main__":
    main()
