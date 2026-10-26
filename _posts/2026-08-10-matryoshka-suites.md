---
title: 'Matryoshka Language Model Suites'
date: 2026-08-10 15:00:00 -0400
categories: [featured, publications]
author: me
description: "Nesting a whole suite of LMs (500M, 1.5B, 3B) into a single architecture trained end-to-end saves 36% training compute and speeds up speculative decoding by 14-26%."
image: img/thumbnails/matryoshka_thumb.jpeg
tags: [language-models, pretraining, efficiency, distillation]
---

[![arXiv](https://img.shields.io/badge/arXiv-2608.09703-b31b1b.svg)](https://arxiv.org/abs/2608.09703)

**Abstract**<br/>
Training a language model suite classically requires training each model separately and serving them independently. We improve both training and inference efficiency by stacking sub-models of increasing size into a single nested architecture trained end-to-end. This Matryoshka training framework reduces the total parameter count of the suite, enables low-cost distillation from the largest to all smaller sub-models at every training step, and is well-suited for speculative decoding as the draft model is contained within the verifier. We validate our approach by training a Matryoshka suite comprising 500M, 1.5B, and 3B sub-models. Our suite is on par with independently trained baselines on benchmark performance and validation and out-of-domain perplexities, while using 36% less training compute and improving the throughput of speculative decoding by 14-26%. We also ablate key architectural choices, offering guidance for building strong Matryoshka LM suites.

This work was co-authored with my postdoctoral advisor [Yoav Artzi](https://yoavartzi.com/) at Cornell Tech.

Here is the PDF version of the paper that [you can also find on arXiv](https://arxiv.org/pdf/2608.09703):
<iframe src="https://docs.google.com/gview?url=https://arxiv.org/pdf/2608.09703&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>

Please cite as:
```bibtex
@misc{godey2026matryoshka,
      title={Matryoshka Language Model Suites},
      author={Nathan Godey and Yoav Artzi},
      year={2026},
      eprint={2608.09703},
      archivePrefix={arXiv},
      primaryClass={cs.AI}
}
```
