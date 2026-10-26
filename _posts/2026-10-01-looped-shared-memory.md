---
title: 'The Surprising Effectiveness of Shared Memory in Looped Transformers'
date: 2026-10-01 15:00:00 -0400
categories: [publications]
author: me
description: "Looped Transformers whose later recursions read the first recursion's KV cache improve perplexity while using 76-79% less context memory."
image: img/thumbnails/lpt_thumb.jpeg
tags: [language-models, looped-transformers, kv-cache, efficiency]
---

[![arXiv](https://img.shields.io/badge/arXiv-2610.02383-b31b1b.svg)](https://arxiv.org/abs/2610.02383)

**Abstract**<br/>
Looped Transformers apply the same layers several times per token, adding compute to improve quality without more parameters. Each recursion, however, writes its own key-value cache, so memory still grows with compute. Inference-time techniques can shrink this cache at a cost in quality. We pretrain looped language models to share memory: only the first recursion writes a cache, and later recursions read it while keeping a short window of their own. Surprisingly, we find that sharing memory does not cost quality and instead improves it. At 150M-1B parameters, our Looped Prediction Transformer (LPT) and its hybrid variant set a new quality-memory frontier for looped models: with five recursions, the hybrid lowers validation perplexity on FineWeb-Edu by 1.12-1.82 relative to a same-size standard Transformer while using 76-79% less context memory. Through an extensive analysis, we investigate why memory sharing helps. Shared and local memory develop different representations, and later recursions attend mostly to the shared memory, which also acts as a gradient highway to the first recursion.

This paper was led by Giovanni Monea during an internship at IBM Research, which I co-advised with Ramón Fernandez Astudillo. It was co-authored with Keshav Ramji, Yousef El-Kurdi, Luis A. Lastras, and my postdoctoral advisor [Yoav Artzi](https://yoavartzi.com/).

Here is the PDF version of the paper that [you can also find on arXiv](https://arxiv.org/pdf/2610.02383):
<iframe src="https://docs.google.com/gview?url=https://arxiv.org/pdf/2610.02383&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>

Please cite as:
```bibtex
@misc{monea2026sharedmemory,
      title={The Surprising Effectiveness of Shared Memory in Looped Transformers},
      author={Giovanni Monea and Keshav Ramji and Yousef El-Kurdi and Luis A. Lastras and Yoav Artzi and Nathan Godey and Ramón Fernandez Astudillo},
      year={2026},
      eprint={2610.02383},
      archivePrefix={arXiv},
      primaryClass={cs.LG}
}
```
