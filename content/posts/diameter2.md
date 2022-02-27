---
title: "Computing the Diameter in any dimension: Part II"
author: "Matt Piekenbrock"
date: '2022-02-27'
slug: diameter_2
include_toc: true
categories: ["C++"]
tags: ["post"]
output: 
  blogdown::html_page:
    keep_md: TRUE
    self_contained: FALSE
layout: single.pug
draft: true 
--- 

# The Algorithm

We can now combine the above observations to give a simple algorithm. First, consider this high-level description of a sub-algorithm which finds a double-normal:

<div class="bg-gray-100 px-4 pt-2 border-2" style="border-width: 1px !important; border-color: black !important;">
<span class="font-bold underline text-lg"> Double Normal Algorithm </span>

1. Set $\lambda = 0$ as the current estimate $D(X)$
2. Pick a random point $p \in X$. 
3. Find the point $q \in X$ furthest away from $p$. 
    * a. If $d_X(p, q) > \lambda$, set $p := q$, $\lambda := d_X(p, q)$ and go to (2)
    * b. Otherwise $d_X(p, q) = \lambda$. Return $(p,q)$.

</div>

This algorithm is guaranteed to terminate with some double-normal $(p,q)$ and runs in $O(nh)$ time, where $h$ is the number of vertices on the convex hull $\mathcal{C}(X)$ of $X$. By Observation \#3, once th algorithm terminates, we've obtained a pair of points $(p,q)$ on $\mathcal{C}(X)$. Moreover, it's simplicity makes it very easy to optimize: only distance computations are needed, no fancy data structures with high-latency access times. 

Now we can incorporate Observations \#1 and \#2 into a preliminary algorithm. 

<div class="bg-gray-100 px-4 pt-2 border-2 not-prose" style="border-width: 1px !important; border-color: black !important;">
<span class="font-bold underline text-lg"> iterated_search(X, P) </span>

$m, \; Q,\;\Delta_X\; \gets \text{random } p \in P,\;P,\; 0$

$\text{while}\;(\;Q \neq \emptyset \;)\text{:}$

&nbsp;&nbsp;&nbsp;&nbsp; $(p, q) \gets \text{double\_normal}(X, m)$

&nbsp;&nbsp;&nbsp;&nbsp; $\text{if}(\; d_X(p,q) \geq \Delta_X \;):$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $\; \Delta_X, \; Q \;\gets \; d_X(p,q), \; X \setminus B[p,q]$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $\text{if}(\; Q \neq \emptyset \;):$
    
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $m \gets \argmin_{p_i \in P}(\; d_X(p_i, \frac{p+q}{2}) \; )$ 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $\text{else:}$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $\text{break}$

$\text{return}((p, q), Q)$

</div>