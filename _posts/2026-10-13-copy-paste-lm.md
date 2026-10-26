---
title: 'Copy-Paste Language Models'
date: 2026-10-13 15:00:00 -0400
categories: [featured, publications]
author: me
description: "A lightweight Copy-Paste head next to the LM head makes copying explicit, improving training efficiency, downstream and long-context performance, and partly bypassing the LM head gradient bottleneck."
image: img/thumbnails/cplm_thumb.jpeg
tags: [language-models, copying, architecture, gradients]
---

[![arXiv](https://img.shields.io/badge/arXiv-2610.19247-b31b1b.svg)](https://arxiv.org/abs/2610.19247)
[![Project page](https://img.shields.io/badge/Project-page-blue.svg)]({{ '/cplm/' | relative_url }})

**Abstract**<br/>
Transformers are intuitively considered to be efficient at copying from their inputs. We actually show that the ability of LLMs to copy in context can be improved through explicit modeling. We propose Copy-Paste Language Models (CPLMs), which add a lightweight Copy-Paste head to the conventional language modeling (LM) head. CPLMs improve training efficiency, downstream performance, and offer new operating points in long-context and retrieval setups. We validate our approach by pretraining models from 135M to 1.7B parameters, showing improvements across all scales and backbones with negligible training and inference overheads. We explain the success of CPLMs by showing that they partially mitigate the [LM head gradient bottleneck]({% post_url 2026-03-10-lm-head-bottleneck %}) through an alternative gradient path.

This work was co-authored with my postdoctoral advisor [Yoav Artzi](https://yoavartzi.com/) at Cornell Tech. The [project page]({{ '/cplm/' | relative_url }}) has interactive figures.

Here is the PDF version of the paper that [you can also find on arXiv](https://arxiv.org/pdf/2610.19247):
<iframe src="https://docs.google.com/gview?url=https://arxiv.org/pdf/2610.19247&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>

Please cite as:
```bibtex
@misc{godey2026copypaste,
      title={Copy-Paste Language Models},
      author={Nathan Godey and Yoav Artzi},
      year={2026},
      eprint={2610.19247},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```
