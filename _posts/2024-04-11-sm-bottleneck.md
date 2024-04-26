---
title: 'Why do small language models underperform? Studying Language Model Saturation via the Softmax Bottleneck'
date: 2024-04-11 15:00:00 +0200
categories: [featured, publications]
author: me
description: "Small LM can saturate in performance during training because of the softmax bottleneck."
image: img/thumbnails/sm_thumb-min.jpeg
tags: [thesis, softmax, anisotropy]     # TAG names should always be lowercase
---

[![arXiv](https://img.shields.io/badge/arXiv-2404.07647-b31b1b.svg)](https://arxiv.org/abs/2404.07647)

**Abstract**<br/>
Recent advances in language modeling consist in pretraining highly parameterized neural networks on extremely large web-mined text corpora. Training and inference with such models can be costly in practice, which incentivizes the use of smaller counterparts. However, it has been observed that smaller models can suffer from saturation, characterized as a drop in performance at some advanced point in training followed by a plateau. In this paper, we find that such saturation can be explained by a mismatch between the hidden dimension of smaller models and the high rank of the target contextual probability distribution. This mismatch affects the performance of the linear prediction head used in such models through the well-known softmax bottleneck phenomenon. We measure the effect of the softmax bottleneck in various settings and find that models based on less than 1000 hidden dimensions tend to adopt degenerate latent representations in late pretraining, which leads to reduced evaluation performance.

This paper was co-authored by my PhD supervisors [Eric Villemonte de la Clergerie](http://alpage.inria.fr/~clerger/) and [Benoît Sagot](http://alpage.inria.fr/~sagot/) from Inria's ALMAnaCH team.

Here is the PDF version of the paper that [you can also find here](https://arxiv.org/pdf/2404.07647):
<iframe src="https://docs.google.com/gview?url=https://github.com/NathanGodey/nathangodey.github.io/raw/main/_includes/pdfs/sm_bottleneck.pdf&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>


Please cite as:
```bibtex
@misc{godey2024small,
      title={Why do small language models underperform? Studying Language Model Saturation via the Softmax Bottleneck}, 
      author={Nathan Godey and Éric de la Clergerie and Benoît Sagot},
      year={2024},
      eprint={2404.07647},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```

*This work was funded by the PRAIRIE institute as part of a PhD contract at Inria Paris and Sorbonne Université.*