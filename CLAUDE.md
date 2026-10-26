# nathangodey.github.io

Personal academic site. Plain Jekyll (no theme), deployed to GitHub Pages by `.github/workflows/pages-deploy.yml` on every push to `main`.

## Where things live

| What | File |
|---|---|
| Publications (source of truth) | `_data/publications.yml` |
| News on the home page | `_data/news.yml` |
| Co-author homepages | `_data/people.yml` |
| Old URL → new URL | `_data/redirects.yml` (+ `old_url` on publications) |
| Nav, social links, analytics | `_config.yml` |
| Posts | `_posts/` (listed at /posts/) |
| Home / Publications / Posts / CV | `index.html`, `publications.html`, `posts.html`, `cv.md` |
| Templates | `_layouts/`, `_includes/pub.html`, `_includes/authors.html` |
| All styles | `assets/css/main.scss` (one file, color tokens at the top) |
| Thumbnails | `img/thumbnails/` |
| Standalone project pages | `cplm/` (hand-written HTML, not templated; don't restyle it) |

Content changes should only touch `_data/`, `_posts/` and `img/`. Don't edit generated HTML, and don't add per-paper pages: a paper gets a page only if it has a real project page (like `cplm/`).

## Adding a paper

1. `python3 tools/add_paper.py <arxiv-id> --write` drafts the entry at the top of `publications.yml` and a news item.
2. Fix the draft:
   - `id`: short kebab-case slug (used as the `#anchor` on /publications/).
   - `authors`: names must match `people.yml` spelling to get linked. Mark equal contribution with a trailing `*` or `†` on the name and add `note: "* Equal contribution"`.
   - `venue`: `"Preprint"` until accepted, then e.g. `"NeurIPS 2026"`, and set `year` to the venue year.
   - `tldr`: one plain sentence (shown on the home page if featured).
   - `links`: any of `pdf`, `arxiv`, `code`, `models`, `project`.
3. Thumbnail (only needed if featured): render the paper's pages, pick the figure that explains the idea (usually Figure 1), then
   `python3 tools/add_paper.py thumb <arxiv-id> <id> PAGE X Y W H` (points from the top-left of the page) and set `image:`.
4. News item: keep it to one line; links in Markdown.

## Featured papers (home page)

Set `featured: N` on entries; the home page shows them in increasing `N`. `featured: 1` is the large "Featured" paper next to the bio; the next six fill the 3-column grid (keep it at 6 so rows stay full). Featured papers need an `image`. Remove the field to unfeature.

## When a paper is accepted

Change `venue` and `year`, replace the BibTeX with the proceedings version if one exists, and add a news item.

## Style rules

- Plain, factual wording. No exclamation marks, no emoji, no "excited to share".
- Dates in news use the arXiv or announcement date. Don't guess dates.
- Font is Lato everywhere. One accent color (`--accent`, used for venue tags and the "Featured" label) plus the link blue; don't add more colors, shadows or hover animations. New colors go in the tokens at the top of `main.scss`, with a dark-mode value.

## Check before committing

```sh
bundle exec jekyll build                     # must succeed with no warnings
bundle exec htmlproofer _site --disable-external --no-enforce-https --ignore-files "/cplm/"
bundle exec jekyll serve                     # http://127.0.0.1:4000 — look at /, /publications/
```
