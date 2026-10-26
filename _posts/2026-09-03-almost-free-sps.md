---
title: 'Almost Free State Prediction Separation'
date: 2026-09-03 15:00:00 -0400
categories: [publications]
author: me
description: "A free pause token that writes no keys or values brings most of the gains of state-prediction separation at no inference cost and as little as 1.09× training overhead."
image: img/thumbnails/freesps_thumb.jpeg
tags: [language-models, architecture, pretraining, efficiency]
---

[![arXiv](https://img.shields.io/badge/arXiv-2609.03807-b31b1b.svg)](https://arxiv.org/abs/2609.03807)

**Abstract**<br/>
State-prediction separation (SPS) relieves a language model's hidden state of two competing burdens (*summarizing* the context and *predicting* the next token) by splitting the forward pass into a state stream and a prediction stream. The separation works, but it is expensive: the prediction stream is a second pass over the whole backbone, costing ~1.9× the pretraining FLOPs, and even more in terms of wall-clock time when using a flexible attention mask. This paper makes state-prediction separation almost free. We take the separation to its limit with a *free pause token*: a prediction stream that writes no keys or values at all and so rides the sequence's existing positions. It improves next-token prediction of a standard Transformer by 2-3 centinats in practice on a 1B parameter model, and because it adds no position it costs nothing at inference: no added context length, no KV cache, no decode steps, and essentially no latency, with the growth in inference flops typically irrelevant as it is not the active bottleneck on throughput. The cost is therefore entirely in training where we use four mechanisms to drive it down: a two-pass split that keeps FlashAttention kernels viable, the w=0 prediction window, a shared gated FFN that evaluates one FFN per position rather than one per stream, and phasing the separation onto the tail of the run. Together these bring the overhead versus an optimized pretraining pipeline to 1.33× wall-clock while recovering ~94% of the gain compared to SPS, and to as low as 1.09× along a graceful quality/compute tradeoff. Furthermore, the FFN optimization reduces the raw flops required at inference time. The result is an isoflop, isoparameter, and isotoken improvement over standard next token trained transformers.

This work builds on [The State-Prediction Separation Hypothesis]({% post_url 2026-07-01-state-prediction-separation %}). I am co-first author with John Langford (Microsoft Research), and it was co-authored with Giovanni Monea, my postdoctoral advisor [Yoav Artzi](https://yoavartzi.com/), Harry Dong, Ying Fan, Gustavo de Rosa, and Zheng Zhan.

Here is the PDF version of the paper that [you can also find on arXiv](https://arxiv.org/pdf/2609.03807):
<iframe src="https://docs.google.com/gview?url=https://arxiv.org/pdf/2609.03807&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>

Please cite as:
```bibtex
@misc{langford2026almostfree,
      title={Almost Free State Prediction Separation},
      author={John Langford and Nathan Godey and Giovanni Monea and Yoav Artzi and Harry Dong and Ying Fan and Gustavo de Rosa and Zheng Zhan},
      year={2026},
      eprint={2609.03807},
      archivePrefix={arXiv},
      primaryClass={cs.LG}
}
```
