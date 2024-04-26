---
title: 'Anisotropy Is Inherent to Self-Attention in Transformers'
date: 2024-01-22 15:00:00 +0200
categories: [publications]
description: "Anisotropy (i.e. low angular variability) of LM's representations emerges in intermediate layers of Transformers to facilitate sharper attention patterns."
author: me
tags: [thesis, anisotropy]     # TAG names should always be lowercase
---

[![arXiv](https://img.shields.io/badge/arXiv-2401.12143-b31b1b.svg)](https://arxiv.org/abs/2401.12143)

> **UPDATE**: This paper was accepted to EACL 2024! 🎉
{: .prompt-info }

**Abstract**<br/>
The representation degeneration problem is a phenomenon that is widely observed among self-supervised learning methods based on Transformers. In NLP, it takes the form of anisotropy, a singular property of hidden representations which makes them unexpectedly close to each other in terms of angular distance (cosine-similarity). Some recent works tend to show that anisotropy is a consequence of optimizing the cross-entropy loss on long-tailed distributions of tokens. We show in this paper that anisotropy can also be observed empirically in language models with specific objectives that should not suffer directly from the same consequences. We also show that the anisotropy problem extends to Transformers trained on other modalities. Our observations suggest that anisotropy is actually inherent to Transformers-based models.

This paper was co-authored by my PhD supervisors [Eric Villemonte de la Clergerie](http://alpage.inria.fr/~clerger/) and [Benoît Sagot](http://alpage.inria.fr/~sagot/) from Inria's ALMAnaCH team.

Here is the PDF version of the paper that [you can also find here](https://arxiv.org/pdf/2401.12143):
<iframe src="https://docs.google.com/gview?url=https://github.com/NathanGodey/nathangodey.github.io/raw/main/_includes/pdfs/anisotropy_inherent.pdf&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>


Please cite as:
```bibtex
@inproceedings{godey-etal-2024-anisotropy,
    title = "Anisotropy Is Inherent to Self-Attention in Transformers",
    author = "Godey, Nathan  and
      Clergerie, {\'E}ric  and
      Sagot, Beno{\^\i}t",
    editor = "Graham, Yvette  and
      Purver, Matthew",
    booktitle = "Proceedings of the 18th Conference of the European Chapter of the Association for Computational Linguistics (Volume 1: Long Papers)",
    month = mar,
    year = "2024",
    address = "St. Julian{'}s, Malta",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2024.eacl-long.3",
    pages = "35--48",
}
```

*This work was funded by the PRAIRIE institute as part of a PhD contract at Inria Paris and Sorbonne Université.*