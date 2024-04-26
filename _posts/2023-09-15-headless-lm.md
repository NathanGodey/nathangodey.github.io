---
title: 'Headless Language Models: Learning without Predicting with Contrastive Weight Tying'
date: 2023-09-15 15:00:00 +0200
categories: [featured, publications]
description: "A simple token-level contrastive loss can replace cross-entropy and improve data and compute-efficiency for Masked and Causal LM training, especially when token vocabularies are larger."
author: me
image: img/thumbnails/headless_thumb-min.jpeg
tags: [thesis, language-modeling]     # TAG names should always be lowercase
---

[![GitHub](https://img.shields.io/github/stars/NathanGodey/headless-lm)](https://github.com/NathanGodey/headless-lm)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Encoder-yellow)](https://huggingface.co/nthngdy/headless-bert-bs64-owt2)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Decoder-yellow)](https://huggingface.co/nthngdy/headless-pythia-owt2-70m-ft)
[![arXiv](https://img.shields.io/badge/arXiv-2309.08351-b31b1b.svg)](https://arxiv.org/abs/2309.08351)

> **UPDATE**: This paper was accepted to ICLR 2024! 🎉
{: .prompt-info }

**Abstract**<br/>
Self-supervised pre-training of language models usually consists in predicting probability distributions over extensive token vocabularies. In this study, we propose an innovative method that shifts away from probability prediction and instead focuses on reconstructing input embeddings in a contrastive fashion via Constrastive Weight Tying (CWT). We apply this approach to pretrain Headless Language Models in both monolingual and multilingual contexts. Our method offers practical advantages, substantially reducing training computational requirements by up to 20 times, while simultaneously enhancing downstream performance and data efficiency. We observe a significant +1.6 GLUE score increase and a notable +2.7 LAMBADA accuracy improvement compared to classical LMs within similar compute budgets.

This paper was co-authored by my PhD supervisors [Eric Villemonte de la Clergerie](http://alpage.inria.fr/~clerger/) and [Benoît Sagot](http://alpage.inria.fr/~sagot/) from Inria's ALMAnaCH team.

Here is the PDF version of the paper that [you can also find here](https://openreview.net/pdf?id=ONPECq0Rk7):
<iframe src="https://docs.google.com/gview?url=https://github.com/NathanGodey/nathangodey.github.io/raw/main/_includes/pdfs/hlm.pdf&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>


Please cite as:
```bibtex
@inproceedings{
godey2024headless,
title={Headless Language Models: Learning without Predicting with Contrastive Weight Tying},
author={Nathan Godey and {\'E}ric Villemonte de la Clergerie and Beno{\^\i}t Sagot},
booktitle={The Twelfth International Conference on Learning Representations},
year={2024},
url={https://openreview.net/forum?id=ONPECq0Rk7}
}
```

*This work was funded by the PRAIRIE institute as part of a PhD contract at Inria Paris and Sorbonne Université.*