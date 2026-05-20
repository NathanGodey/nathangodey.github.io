---
title: 'Lost in Backpropagation: The LM Head is a Gradient Bottleneck'
date: 2026-03-10 15:00:00 -0400
categories: [featured, publications]
author: me
description: "The softmax bottleneck isn't only an expressivity issue. It suppresses 95-99% of the gradient norm during backprop, distorting training feedback for the entire model."
image: img/thumbnails/lmhead_thumb.jpeg
tags: [language-models, softmax, optimization, gradients]
math: true
---

[![arXiv](https://img.shields.io/badge/arXiv-2603.10145-b31b1b.svg)](https://arxiv.org/abs/2603.10145)

**Abstract**<br/>
The last layer of neural language models (LMs) projects output features of dimension $D$ to logits in dimension $V$, the size of the vocabulary, where usually $D \ll V$. This mismatch is known to raise risks of limited expressivity in neural LMs, creating a so-called softmax bottleneck. We show the softmax bottleneck is not only an expressivity bottleneck but also an optimization bottleneck. Backpropagating $V$-dimensional gradients through a rank-$D$ linear layer induces unavoidable compression, which alters the training feedback provided to the vast majority of the parameters. We present a theoretical analysis of this phenomenon and measure empirically that 95-99% of the gradient norm is suppressed by the output layer, resulting in vastly suboptimal update directions. We conduct controlled pretraining experiments showing that the gradient bottleneck makes trivial patterns unlearnable, and drastically affects the training dynamics of LLMs. We argue that this inherent flaw contributes to training inefficiencies at scale independently of the model architecture, and raises the need for new LM head designs.

This work was co-authored with my postdoctoral advisor [Yoav Artzi](https://yoavartzi.com/) at Cornell Tech.

Here is the PDF version of the paper that [you can also find on arXiv](https://arxiv.org/pdf/2603.10145):
<iframe src="https://docs.google.com/gview?url=https://arxiv.org/pdf/2603.10145&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>

Please cite as:
```bibtex
@misc{godey2026lost,
      title={Lost in Backpropagation: The LM Head is a Gradient Bottleneck},
      author={Nathan Godey and Yoav Artzi},
      year={2026},
      eprint={2603.10145},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```
