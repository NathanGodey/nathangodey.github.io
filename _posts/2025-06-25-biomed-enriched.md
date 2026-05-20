---
title: 'Biomed-Enriched: A Biomedical Dataset Enriched with LLMs for Pretraining and Extracting Rare and Hidden Content'
date: 2025-06-25 15:00:00 +0200
categories: [publications]
author: me
description: "A two-stage LLM-annotated biomedical pretraining dataset built from PubMed, with quality and domain labels enabling targeted clinical and educational subsets."
venue: ACL 2026
image: img/thumbnails/biomed_thumb.jpeg
tags: [biomedical, dataset, pretraining, data-curation]
---

[![arXiv](https://img.shields.io/badge/arXiv-2506.20331-b31b1b.svg)](https://arxiv.org/abs/2506.20331)

**Abstract**<br/>
We introduce Biomed-Enriched, a biomedical text dataset constructed from PubMed via a two-stage annotation process. In the first stage, a large language model annotates 400K paragraphs from PubMed scientific articles, assigning scores for their type (review, study, clinical case, other), domain (clinical, biomedical, other), and educational quality. The educational quality score (rated 1 to 5) estimates how useful a paragraph is for college-level learning. These annotations are then used to fine-tune a small language model, which propagates the labels across the full PMC-OA corpus. The resulting metadata allows us to extract refined subsets, including 2M clinical case paragraphs with over 450K high-quality ones from articles with commercial-use licenses, and to construct several variants via quality filtering and domain upsampling. Clinical text is typically difficult to access due to privacy constraints, as hospital records cannot be publicly shared. Hence, our dataset provides an alternative large-scale, openly available collection of clinical cases from PubMed, making it a valuable resource for biomedical and clinical NLP. Preliminary continual-pretraining experiments with OLMo2 suggest these curated subsets enable targeted improvements, with clinical upsampling boosting performance by ~5% on MMLU ProfMed and educational quality filtering improving MedQA and MedMCQA by ~1%. Combinations of these techniques led to faster convergence, reaching same performance with a third of training tokens, indicating potential for more efficient and effective biomedical pretraining strategies.

This paper was led by Rian Touchent and co-authored with my PhD supervisor Éric de la Clergerie.

Here is the PDF version of the paper that [you can also find on arXiv](https://arxiv.org/pdf/2506.20331):
<iframe src="https://docs.google.com/gview?url=https://arxiv.org/pdf/2506.20331&embedded=true" style="width:718px; height:700px;" frameborder="0"></iframe>

Please cite as:
```bibtex
@misc{touchent2025biomedenriched,
      title={Biomed-Enriched: A Biomedical Dataset Enriched with LLMs for Pretraining and Extracting Rare and Hidden Content},
      author={Rian Touchent and Nathan Godey and Éric de la Clergerie},
      year={2025},
      eprint={2506.20331},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```
