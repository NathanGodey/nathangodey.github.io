---
title: 'On the Scaling Laws of Geographical Representation in Language Models'
date: 2024-02-29 15:00:00 +0200
categories: [publications]
author: me
image: img/thumbnails/geo_thumb-min.jpeg
description: "The ability to probe geographical information in LLM's representations scales inequally across countries/continents."
tags: [thesis, geographical, frequency]     # TAG names should always be lowercase
---

[![arXiv](https://img.shields.io/badge/arXiv-2402.19406-b31b1b.svg)](https://arxiv.org/abs/2402.19406)

> **UPDATE**: This paper was accepted to LREC-Coling 2024! 🎉
{: .prompt-info }

**Abstract**<br/>
Language models have long been shown to embed geographical information in their hidden representations. This line of work has recently been revisited by extending this result to Large Language Models (LLMs). In this paper, we propose to fill the gap between well-established and recent literature by observing how geographical knowledge evolves when scaling language models. We show that geographical knowledge is observable even for tiny models, and that it scales consistently as we increase the model size. Notably, we observe that larger language models cannot mitigate the geographical bias that is inherent to the training data.

This paper was co-authored by my PhD supervisors [Eric Villemonte de la Clergerie](http://alpage.inria.fr/~clerger/) and [Benoît Sagot](http://alpage.inria.fr/~sagot/) from Inria's ALMAnaCH team.

Here is the PDF version of the paper that [you can also find here](https://arxiv.org/pdf/2402.19406):
<iframe src="https://docs.google.com/gview?url=https://github.com/NathanGodey/nathangodey.github.io/raw/main/_includes/pdfs/geoscaling.pdf&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>


Please cite as:
```bibtex
@misc{godey2024scaling,
      title={On the Scaling Laws of Geographical Representation in Language Models}, 
      author={Nathan Godey and Éric de la Clergerie and Benoît Sagot},
      year={2024},
      eprint={2402.19406},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```

*This work was funded by the PRAIRIE institute as part of a PhD contract at Inria Paris and Sorbonne Université.*