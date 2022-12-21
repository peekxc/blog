---
title: "Perfect Minimal Hashing"
author: "Matt Piekenbrock"
date: '2022-12-03'
slug: pmh
include_toc: true
categories: ["C++", "Python"]
tags: ["post", "hashing"]
output: 
  blogdown::html_page:
    keep_md: TRUE
    self_contained: FALSE
layout: single.pug
draft: true 
--- 

I am not an expert in hashing. However, I was confronted with the following problem the other day: 

> Suppose you have a fixed set of $n$ distinct integers $S = \{s_1, s_2, \dots, s_n \}$. Construct an efficient hash function $h: S \to [n]$ that maps every element $s \in S$ to an integer in the range $[n] = \{1, 2, \dots, n\}$ in such a way that you are <u>guaranteed</u> $O(1)$ worst case access time and $O(n)$ storage. 
> 
> Assume that $S$ is fixed and that you have an infinite amount of preprocessing time. 

Simple, right? I, admittedly, didn't know how to do it. It turns out what I wanted was a practical and [perfect minimal hashing](https://en.wikipedia.org/wiki/Perfect_hash_function#Minimal_perfect_hash_function) function.

In this post, I'll give an elegant way to solve this problem. Before doing so, here's an example problem whose solution is given by solving the above. 

> Suppose you're given a read-only array of $n$ distinct items $S$ in a fixed order, which you must preprocess into a data structure $T$ in preparation for a sequence of $N$ <u>random index queries</u>: queries which request the position $i$ of any $s_i$ in $S$. 
> 
> Assume the number of queries $N >> n$ is extremely large, potentially infinite. 
> 
> To be practical, the data structure should map each item $s_i$ to its index $i$ using only a constant number of simple arithmetic operations, say, operations from the set {+,-,>>,<<,^}.

<!-- One can come up with a number of scenarios where this problem could arise in real examples. For example, when $N = \infty$, this is like asking to construct the ultimate read-only cache for a streaming algorithm under the assumption of randomized (uniform) access.  -->

----

First, let's acknowledge the elephant in the room. Isn't this extremely simple? Why don't we bust out the secret weapon: [HashMap-uh](https://youtu.be/pKO9UjSeLew?t=45). Those have $O(1)$ lookup complexity, right? 

Let's experiment with this idea in Python. Suppose we have ~10k distinct random integers $S$ from a 100k range $\mathcal{U}$.

```python
import numpy as np 
U = range(1e6)
S = np.random.choice(U, size=1e5, replace=False)

```

To solve the above problem, we may be tempted to map each integer to its index via a [dictionary comprension](https://peps.python.org/pep-0274/). 

```python
h = { s : i for i,s in enumerate(S) }
```
Sure enough, this creates a valid mapping. And it's pretty fast. 

```python
all([h[s] == i for i, s in enumerate(S)]) 
## True

timeit.timeit(lambda: [h[s] for s in S], number=100)/100
## 0.002030719479999945 
```
Hashing all 10k elements takes about ~2 ms. Not bad. But does this solve the problem? Is the $O(1)$ access time _guaranteed_? 

**Spoiler alert:** It is not. The time complexity given at [python.org](https://wiki.python.org/moin/TimeComplexity) states the complexity of accessing elements in a dictionary is _average case_ $O(1)$ and _worst case_ $O(n)$ (amortized). Because integers are such simple objects, Python's default hashing technique does quite well. 
More details on Pythons `dict` implementation can be found here
[SE post](https://stackoverflow.com/questions/327311/how-are-pythons-built-in-dictionaries-implemented) and [this blog post](http://www.laurentluce.com/posts/python-dictionary-implementation/). The actual `dict.c` source is [here](https://hg.python.org/cpython/file/52f68c95e025/Objects/dictobject.c).

## Experimenting with `dict` 
Let's get an idea of how good Python is at hashing. Suppose we create a dumb wrapper class for Python's standard `int` type (which, incidentally, may actually a `bignum` type due to [PEP 237](https://peps.python.org/pep-0237/))

```python
@dataclass
class Int():
  val: int = 0
```

The dataclass decorator just adds `__repr__` and `__init__` methods. Now, let's replace our set `S` with these wrapped types

```python
S = [Int(i) for i in S]
```
Also, let's rebuild our hash map `h` and benchmark the average access time for 10k elements. 

```python
h = { s : i for i,s in enumerate(S) }
timeit.timeit(lambda: [h[s] for s in S], number=100)/100
## 0.0020396138799969776
```

Still about ~2 ms, nothing has really changed. Now, consider the following code: 

```python 
Int.__hash__ = lambda self: 0
h = { s : i for i,s in enumerate(S) }
timeit.timeit(lambda: [h[s] for s in S], number=100)/100
## 11.08112517602
```
_Holy hell_. That is $\approx 5433 \, \text{x}$ slower than before. What in the world just happened?

The `__hash__` dunder is a magic method that Python relies on to build dictionaries. By returning a constant---effectively the worst hash function we could use---we've essentially reduced `dict`'s access time to $O(n)$. Re-running the example with `Int.__hash__ = lambda self: hash(self.val)` restores the ~2 ms runtime. 

So if the hash function is particularly terrible, we're likely better off sorting `S` into an array and relying on the $O(n \log n)$ lookup via something like `bisect` or `np.searchsorted`. 

## Python's `int` \_\_hash\_\_ function 
<!-- https://stackoverflow.com/questions/37612524/when-is-hashn-n-in-python -->
Assuming Python takes the hash of an element and modulo's it with the table size, we can inspect the average number collisions via: 
```python
len(S)/len(np.unique([hash(s)%len(S) for s in S]))
## ~ 1.578
```
So Python does quite well with integers, and in this sense the problem as given is _effectively_ solved. However, the performance will inevitably depends on the size of $\mathcal{U}$ in relation to the size of $S$. For example, if we have $\lvert S \rvert = \frac{1}{2}\lvert \mathcal{U} \rvert$, performance drops an order of magnitude: 

```python
U = range(2*100000)
S = np.random.choice(U, size=100000, replace=False)
h = { s : i for i,s in enumerate(S) }
timeit.timeit(lambda: [h[s] for s in S], number=100)/100
# 0.021988959899990734
```

Moreover, if the set $S$ is comprised of not just simple integers but some composite type, the performance could be drastically different.

## Hashing 

Let's get some definitions out of the way. Let $\mathcal{U}$ denote a universe of hashable elements and let $S \subseteq \mathcal{U}$ denote any subset of $\mathcal{U}$ with which we want create a hash table. A hash function $h: S \to [m]$ is a mapping between a set $S$ and table $T[1:m]$ of size $m = \lvert T \rvert$. In practice, it is often the case that $h : S \to \mathbb{Z}$ and $h$ is restricted to $[m]$ via a modulo operation. A hash function is said to be _perfect_ with respect to $S$ if there are no collisions: 

$$\forall s,s' \in S, \quad h(s) \neq h(s') \implies s \neq s'$$

In math speak, one notices that the definition of a perfect hash function is essentially that of an injective function. If $m = n$, i.e. the size of hash table matches the size of input set $S$, then the definition coincides with a bijection. Bijections, by definition, are invertible maps. Thus, the problem can be re-stated as finding a invertible map $h: S \to [n]$ which uses $O(1)$ operations to evaluate. 

In general, hash functions are imperfect: it is entirely possible to map two distinct object $s \neq s'$ to the same hash value $h(s) = h(s')$. If this happens, we say $s$ _collides_ with $s'$ in $h$. In order to recover the correct mapping, one typically resolves to some sort of _collision resolution_ strategy, such as quadratic hashing, open addressing, linear probing, etc.

## Beyond the basics
This [excellent blog post]() shows an excellent solution to the minimal perfect solution. It goes as follows. 

Suppose we have a set of random hash functions $\mathcal{H} = \{h_1, h_2, \dots, h_k \}$ where each individual $h_i : S \to [n]$ may produce collisions, but the chances are relatively low (to be elaborated on). Recall that the goal creating a perfect hash function is akin to finding a bijection $h_\ast : S \to [n]$. 

Suppose there exists a vector $x \in \mathbb{Z}^n$ such that the function $h_\ast$:

$$ h_\ast(s) = x_{h_1(s)} + x_{h_2(s)} + \dots + x_{h_k(s)} $$

is a perfect hash function. Since both $S$ and $\mathcal{H}$ are fixed, the task reduces to finding such a vector $x$. If $S = \{s_1, s_2, \dots, s_n \}$ is ordered arbitrarily, the above can be restated as solving:

$$
\begin{align*}
x_{h_1(s_1)} + x_{h_2(s_1)} + &\dots& + x_{h_k(s_1)}  = 1 \\
x_{h_1(s_2)} + x_{h_2(s_2)} + &\dots& + x_{h_k(s_2)}  = 2 \\
& \;\; \vdots \;\;& \\
x_{h_1(s_n)} + x_{h_2(s_n)} + &\dots& + x_{h_k(s_n)}  = n
\end{align*} 
$$

Thus, we can formulate the problem of finding a suitable $x \in \mathbb{Z}^n$ as solving the linear system: 

$$ A x = b \; \Longleftrightarrow \; x = A^{-1} b$$

where $A \in \mathbb{B}^{n \times n}$ is a boolean matrix with at most $nk$ non-zero entries and $b = [n]$. This is best demonstrated with an example. 

Let $S = \{\}$


There are plenty of sparse linear system solvers in e.g. SciPy. So, all that remains is to find a set of $k$ simple hash functions, where $k << n$ is a small constant, such that the corresponding matrix $A$ is invertible.

### Choosing the hash functions 












