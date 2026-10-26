---
title: 'The State-Prediction Separation Hypothesis'
date: 2026-07-01 15:00:00 -0400
categories: [featured, publications]
author: me
description: "Disentangling the two roles of a Transformer's forward stream (storing state and predicting the next token) into two computation streams yields better data and compute efficiency."
venue: NeurIPS 2026
image: img/thumbnails/sps_thumb.jpeg
tags: [language-models, architecture, pretraining, efficiency]
---

[![arXiv](https://img.shields.io/badge/arXiv-2607.01218-b31b1b.svg)](https://arxiv.org/abs/2607.01218)

**Abstract**<br/>
Transformers use the same forward computation stream to both predict the next token and store useful state for future token predictions. We formulate the *state-prediction separation hypothesis*: disentangling the two roles yields better language modeling performance. We design a Transformer variant that uses two computation streams to separate the two functions, and conduct pretraining experiments across various scales. Our experiments show that state-prediction separation consistently offers better data and compute efficiencies, improving validation loss and outperforming standard Transformers by 2-3 percentage points on average on downstream tasks. We also conduct extensive empirical analysis that rules out potential confounders and demonstrates the fundamental difference in the gradients our design entails.

This paper was led by Giovanni Monea and co-authored with Kianté Brantley and my postdoctoral advisor [Yoav Artzi](https://yoavartzi.com/) at Cornell Tech.

Here is the PDF version of the paper that [you can also find on arXiv](https://arxiv.org/pdf/2607.01218):
<iframe src="https://docs.google.com/gview?url=https://arxiv.org/pdf/2607.01218&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>

Please cite as:
```bibtex
@misc{monea2026stateprediction,
      title={The State-Prediction Separation Hypothesis},
      author={Giovanni Monea and Nathan Godey and Kianté Brantley and Yoav Artzi},
      year={2026},
      eprint={2607.01218},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```
