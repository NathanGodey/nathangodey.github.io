---
title: 'What does the loss of a language model mean?'
date: 2026-10-27 12:00:00 +0100
hidden: true       # online at its URL, but not listed on /posts/
draft: true        # keeps it out of feed.xml (jekyll-feed skips draft: true)
sitemap: false     # keeps it out of sitemap.xml
description: "Samples from a 125M model at every loss level from 10.8 to 2.87, next to n-grams, GPT-1, GPT-2 and Pythia."
tags: [software]
---

Ever wondered what a loss of 3.28 means for a language model? Here is an answer: read what a model writes at that loss, and at every other loss on the way down. Drag the slider and see.

{% include html/loss_levels.html %}

## What you are looking at

The model is a 125M-parameter transformer trained on FineWeb-Edu. A checkpoint was saved the first time its training loss crossed each of 200 preset levels, from 10.8 at initialization down to 2.87, and each position of the slider is one of those checkpoints.

Each checkpoint shows the same 20 prompts and 20 samples written from scratch, drawn with the same random numbers every time, so you can follow one sample as the loss goes down.

The curve is the loss on about a million held-out tokens of FineWeb-Edu (the training data) or of FineWeb (general web text); the buttons above it switch between the two. Click anywhere on the curve to jump to that checkpoint.

The labelled markers are other models scored on the same documents: n-gram models trained on 100M FineWeb-Edu tokens, GPT-1, the four GPT-2 sizes and three Pythia models. Each model uses its own tokenizer, so its loss is converted to bits per byte and back to this model's tokens. The 3.28 above is the target of the [nanoGPT speedrun](https://github.com/KellerJordan/modded-nanogpt), set at the loss of OpenAI's GPT-2 small on FineWeb, so it shares that marker; it is measured with GPT-2's tokenizer on the speedrun's own validation set, which is why the marker reads a little higher. The noise speedrun marker is estimated from its published loss, not measured. Click a label to jump to the first checkpoint that reaches it.

## How the samples were made

- Model: [`nthngdy/loss-levels-125M`](https://huggingface.co/nthngdy/loss-levels-125M), one branch per checkpoint.
- Pure ancestral sampling: temperature 1, no top-k, no top-p, no repetition penalty, 256 new tokens. This is the distribution the loss measures; truncated sampling would make weak checkpoints look better than their loss.
- Unconditional samples start from a single `<|endoftext|>` token. Prompted samples start from the prompt alone, without a BOS token.
- Each sample uses the same random numbers at every checkpoint (unconditional sample *i* uses seed 1234 + *i*, every prompt uses seed 1234), so a sample changes gradually as the model trains instead of being redrawn.
