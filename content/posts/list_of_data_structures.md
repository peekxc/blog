---
title: " Getters and Setters are DEAD"
author: "Matt Piekenbrock"
date: 2017-02-01
categories: ["programming"]
tags: ["programming"]
slug: getter_setter
include_toc: true
layout: single.pug
draft: true 
---

@jacobdurden13#9422 @taelkast#3307 regarding non-standard data structures worth knowing--SE already has a list of niche data structures, rated and ranked by upvotes: https://stackoverflow.com/questions/500607/what-are-the-lesser-known-but-useful-data-structures

Here are some of the data structures on that list I've actually implemented myself or borrowed from other peoples code + the application I used it in: 
- Tries (rep. abstract simplicial complexes actually)
- skip lists (segment intersection problem)
- kd-trees + B-trees + ball trees (knn....every day baby!)
- bit arrays (for storing set relations + rep. covers)
- disjoint set (used to solve MST problem)
- splay trees (used to solve dynamic MST problem)
- Fib. Heaps (never used... but they are heap w/ lowest complexity so worth learning)
- Huffman trees (never actually used, but Jace and I had to learn them like 5x at least) 
- Van emde boas trees (good to learn, has nice complexity statements, useless in practice) 
- Cache-oblivious indexing (this is more of a concept, but it's incredibly useful)
- Half-edge data structure (used in 2D persistence actually) 
- Interval trees and Segment trees (solves subset sum amongst other things) 
- Randomized cut-set idea 



Ropes and bloom filters are the top two in the list, but I've never used either of them. Nonetheless I hear they're great! 

In that same list, there are data structures which I've never found a great use for, or I just think they're probably not great data structures, i.e. someone came up with a data structure, called it 'S', says it's cool and does stuff.... but in reality there's another data structure 'A' that probably solves the same problem better. Even worse, some of these haven't had their complexities studied, or if they have it's unclear whether they're correct because only 3 people have used these data structures and they were all GIS people who use excel or something like that. Thus, here's a list of these data structures I *don't* recommend learning. 
- Finger trees. I just haven't found a situation where you wouldn't prefer an implicit treap 
- circular/ring buffer. Just seems trivial. 
- Zippers. Prove me wrong and show me when these are useful. 
- Merkle trees - I am allergic to domain-specific data structures described w/ domain-specific jargon 
- Inverted index - I am allergic to domain-specific data structures described w/ domain-specific jargon 
- Nested sets - I am allergic to domain-specific data structures described w/ domain-specific jargon 
- Fenwick tree - why not use a segment tree? 