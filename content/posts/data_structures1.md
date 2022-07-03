---
title: "Knowing your data structures: Part I"
author: "Matt Piekenbrock"
date: '2022-07-03'
slug: data_structures_1
include_toc: true
categories: ["data_structures"]
tags: ["post"]
output:
blogdown::html_page:
keep_md: TRUE
self_contained: FALSE
layout: single.pug
draft: false
---

A question that occurs enough in my life for me to document my answer in a blog post: *what are the major data structures everyone should know?*

The question is clearly ill-posed from the start. Fundamentally, the use/non-use of any particular data structure completely depends on what _specific problem_ is being solved. Data structures are a means of organizing memory and controlling complexity: without reference to a particular computational problem, the question presumes there is some irrefutable 'master list' containing some set of _de facto standard_ data structures one should know. __There is none.__

> The battle for a fast system can be won or lost in specifying the problem it is to solve.
> - Jon Bentley, Programming Pearls

Nonetheless, there are some data structures and ways of using them that I have found to be particularly useful in solving problems in my own life. Towards encouraging myself to write more of these posts, I'll keep the explanations of these data structures succinct. There are already a plethora of sources online explaining them more in detail. And since this is part I, I'll start by talking about a category of data structures that everyone should use *every single day*...


# Arrays

An _array_ is a sequence container that organizes $n$ homogeneous elements within a contiguous block of memory that supports randomized ($O(1)$) access to its elements. Contiguity and homogeneity are necessary conditions for randomized access: homogeneity guarantees the size of each element is fixed and contiguity guarantees the elements can be indexed in constant-time using [offsets](https://en.wikipedia.org/wiki/Offset_(computer_science)). If someone makes references to an "array" data structure that does not support these two properties, that's fine---but whatever data structure they're referring to is not the one defined here.

There are many types of arrays, of which the following are worth discussing in detail:

1. Dynamic size arrays
2. Fixed-size arrays
3. Bit arrays
4. Matrices


## Dynamic size arrays

A _dynamic array_ is an _array_ that also supports insertion and deletion of elements. Necessarily, these operations may change the array's size. Typically, [appending](https://en.wikipedia.org/wiki/Append) to the end of an array takes $O(1)$ [amortized time](https://en.wikipedia.org/wiki/Amortized_analysis)---the worst-case complexity is always $O(n)$ to ensure the contiguity property is met.


Suppose you have a [0-arity](https://en.wikipedia.org/wiki/Arity) function $f$ generating data dynamically---perhaps a [closure](https://en.wikipedia.org/wiki/Closure_(computer_programming))---whose output type $T$ you know. Suppose further you know that you know $f$ is _valid_ if and only if $f()$ is positive; otherwise $f() = 0$ signals that $f$ is no longer generating data. This is actually a simple though sub-optimal way to implement the [iterator pattern](https://en.wikipedia.org/wiki/Iterator_pattern).

How can one efficiently store the data streaming in through $f$?

Dynamic arrays are a good choice here because 1. you don't know how many items there will be ahead of time and 2. you know the type $T$ and thus you know each elements size. The prototypical [STL](https://en.wikipedia.org/wiki/Standard_Template_Library)-container for representing dynamic arrays is the `std::vector` class. Suppose $T = \text{int}$ for simplicity. The following might represent this data-storage process:

```cpp
int x = 0;
auto v = std::vector< int >(); // empty vector; observe v knows its element type
while (x = f()){
  v.push_back(x); // amortized O(1) appending
}
```
Here in the line `while(x = f())` I'm abusing the fact that assignments are valid expressions in conditionals and that integers [implicity type cast](https://en.wikipedia.org/wiki/Type_conversion) to booleans that happen match the condition of the problem. This is sometimes an [anti-pattern](https://en.wikipedia.org/wiki/Anti-pattern), but I think it's fine (see also [Yoda conditions](https://en.wikipedia.org/wiki/Yoda_conditions)).

What's happening here under the hood? Assuming `v` is initialized to an empty vector ([not reality](https://stackoverflow.com/questions/12271017/initial-capacity-of-vector-in-c)), the first call to `push_back()` will do the following:

- Copy `v`'s contents, if any, to a buffer
- [Free](https://en.cppreference.com/w/c/memory/free) the memory held by `v`
- Re-allocate a new contiguous block of memory $m$ of size $2n*\mathrm{sizeof}(\text{int})$
- Copy the contents from the buffer to $m$
  
This entire process happens whenever the [capacity](https://en.cppreference.com/w/cpp/container/vector/capacity) exceeds some power of two, $2^0, 2^1, 2^2, \dots, 2^k$. Assuming $f$ returns $N$ valid values, up to at most $2^{\lceil \log(N)/\log(2)) \rceil} -1$ times. All other insertions to the end take $O(1)$. Thus, the number of insertions which take $O(1)$ time increases exponentially, making the number $O(n)$ re-allocations exceedingly rare as $n \to \infty$. This is what is meant by _amortized time_.

Strictly speaking, re-allocations need not _always_ be performed when $n$ exceeds powers of $2$. In general, if $T(n)$ is the worst-case running time for a sequence of $n$ computations, then the amortized time for each operation is $T(n)/n$, thus an operation runs in _amortized_ $O(1)$ if the operation has $\theta(1)$ complexity. Since vector-reallocation takes worst-case $O(n)$, a sequence of $n+1$ _append_ operations to an array of size $n$ each has complexity $(n \theta(1) + T(n))/(n + 1) = \theta(1)$. In the array insertion case, as long as the frequency with which the allocator chooses to perform the re-allocation is inversely proportional to a superpolynomial, then one can say the insertion operation is amortized constant.

What is the correct dynamic-array data structure in Python? Well, of course, it's defined by the [array module](https://docs.python.org/3/library/array.html):

```python
from array import array
a = array('I') # an array *must* know its element type
f = range(15) # creates an iterable - using O(1) memory!
a.extend(f) # sequence of appends taking amortized O(1) time
```

## Fixed-sized array

A _fixed-size array_ is an _array_ whose size is known ahead of time, in some sense. In C++, this means that an array's size must be specified _at compile time_. The canonical STL-container for a fixed-size array is the [std::array](https://en.cppreference.com/w/cpp/container/array).

```cpp
auto a = std::array< int, 15 >(); // must know its type *and* size
```

Observe both the type (_int_) and size (_15_) are supplied at compile-time via the type's [template parameters](https://en.cppreference.com/w/cpp/language/template_parameters). Indeed, this matches the definition of a fixed-size array given above as the type itself includes the size information.

Fixed-sized arrays have advantages in C++ as they are typically stored [on the stack](https://www.learncpp.com/cpp-tutorial/the-stack-and-the-heap/) or in global program memory, which [can be much faster to access than the heap](https://publicwork.wordpress.com/2019/06/27/stack-allocation-vs-heap-allocation-performance-benchmark/). This is not strictly true, however, because [alloca exists](https://man7.org/linux/man-pages/man3/alloca.3.html) and can be used to create "stack-allocated dynamic arrays." Nonetheless, if an array's size is known at compile-time, a fixed-size array should be used.

Python, to my knowledge, does not have a fixed-size array implementation. The canonical fixed-size array data structure most people use is the [numpy array](https://numpy.org/doc/stable/reference/arrays.html).

```python
a = np.empty(shape=(2,), dtype=int) # a fixed-size array knows it's size and it's type
print(a) # junk: a = array([4607182418800017408, 4613374868287651840])
a[[0, 1]] = 1, 2 # This takes O(1) time
print(a[2]) # this throws
# > IndexError: index 2 is out of bounds for axis 0 with size 2

b = np.append(a, 3) # a is fixed, so a copy must occur!
print(a) # [1,2]
print(b) # [1,2,3]
```

One might be tempted in thinking that numpy arrays are dynamic because of `np.append`/`np.insert`, but this is not true--numpy arrays, as shown above, must perform a copy at some level of memory because they are fixed size.

One might also be tempted in thinking that numpy arrays are type-agnostic because they support things like [void](https://numpy.org/doc/stable/reference/arrays.scalars.html#numpy.void) and [object](https://numpy.org/doc/stable/glossary.html#term-object-array) types; this is a facade. The generic types are just placeholders or typecast-compatible parent types of types whose size (or size-bound) [still must be known at instantation](https://numpy.org/doc/stable/reference/arrays.scalars.html#numpy.flexible). Numpy arrays are true arrays: they [are homogeneous](https://numpy.org/doc/stable/glossary.html#term-homogeneous) and they [know their (d)type](https://numpy.org/doc/stable/reference/arrays.dtypes.html).

## Bit arrays

On the surface, a _bit array_ seems like it's just an _array_ whose element type is a [bit](https://en.wikipedia.org/wiki/Bit). This is mostly true, but there are some serious subtleties in how one should use and think about bit arrays.

We typically think of our standard types (int, float, double) as being close to the [word](https://en.wikipedia.org/wiki/Word_(computer_architecture)) size---either 32-bits or 64-bits. In theory, this means that the processor ought to be able to do simple arithmetic operations (e.g. addition) and memory operations (e.g. loading a variable into a register) with these types using $c$-cycles, where $c$ is some very small constant. This is not entirely true, of course---to say anything concrete requires knowledge of the [computer architecture](https://en.wikipedia.org/wiki/Computer_architecture), whether the instruction set is [CISC](https://en.wikipedia.org/wiki/Complex_instruction_set_computer) or [RISC](https://en.wikipedia.org/wiki/Reduced_instruction_set_computer), etc. Nonetheless, it seems intuitive that word-size types could perhaps be manipulated using word-size instructions each with $\approx 1$ cycle. It is tempting to conflate asymptotic statements about array operations (like $O(1)$ randomized access) with the notion of an [instruction cycle](https://en.wikipedia.org/wiki/Instruction_cycle).

Since each element is much smaller than the word-size, much of this intuition simply does not translate. Statements about an array's complexity no longer hold much meaning; we must talk about what is happening at the memory level. For example, although a bit array is potentially a very compact representation from the storage perspective, any and all manipulation of individual bits at the hardware level must be performed via [usually several] [bitwise operations](https://en.wikipedia.org/wiki/Bitwise_operation). Sometimes these operations are efficient and sometimes they are not, leading many to question the utility of such a data structure. Indeed, This has been [a constant point of contention](https://howardhinnant.github.io/onvectorbool.html) in the evolution of data structures in C++ used to represent arrays of bits. In fact, some would say that C/C++ [does not provide support for an array of bits](http://www.mathcs.emory.edu/~cheung/Courses/255/Syllabus/1-C-intro/bit-array.html) but rather provides _all the necessary operations_ (also see [bit hacks](http://graphics.stanford.edu/~seander/bithacks.html)) to allow the developer to implement an array of bits.
Naturally, this has lead to many bit array representations in the STL, such as the [bit array](https://cplusplus.com/reference/bitset/bitset/), [std::vector<bool>](https://en.cppreference.com/w/cpp/container/vector_bool), and [bit fields](https://en.cppreference.com/w/cpp/language/bit_field).

Python provides [bitwise operations natively via PEP 225](https://peps.python.org/pep-0225/) and there's a decent [bitarray package](https://pypi.org/project/bitarray/).


## Matrices

A _dense matrix_ is a generalization of a fixed-size _array_ whose size is recorded by two numbers, instead of one. More generally, a _$d$-dimensional array_ is a fixed-size array whose size is recorded by $d$ numbers. These are sometimes called [multi-dimensional arrays](https://en.wikipedia.org/wiki/Array_data_type#Multi-dimensional_arrays) and should not be confused with [jagged arrays](https://en.wikipedia.org/wiki/Jagged_array). Matrices are still memory-contiguous and type-homogenous. Instead of elements being indexed by offsets, they are indexed by [strides](https://en.wikipedia.org/wiki/Stride_of_an_array) (the multi-dimensional generalization of an offset).

There are many concepts that are useful to know about a particular matrix implementation. For example, since arrays store memory contiguously, should memory be stored in [column or row-major order](https://en.wikipedia.org/wiki/Row-_and_column-major_order)? C/C++'s 'native' multi-dimensional array is row-major. For various performance reasons, many popular linear algebra libraries in C++ use column-major order (e.g. [Eigen](https://eigen.tuxfamily.org/dox/group__TopicStorageOrders.html) and [Armadillo](http://arma.sourceforge.net/docs.html)) (as does [MATLAB and Fortran](https://www.mathworks.com/help/coder/ug/what-are-column-major-and-row-major-representation-1.html)). In Python, the canonical matrix implementation is with NumPy, but by default uses row-major ordering.


## Conclusion + things worth thinking about

Arrays are not just the simplest data structures, they are also the most performant ones in many situations. An array is _the most compact and most cache-friendly data structure that there is_. It should be one's __first choice__ to use when the situation allows. This may sound obvious to anyone who has worked with a compiled language, yet there exist many random [internet articles abound](https://betterprogramming.pub/stop-using-lists-for-everything-in-python-46fad15217f4) recommending the average Python programmer 'branch out' by using other non-array data structures like _sets_ and _dictionaries_. I often see this with my own students, many of who will use lists because they don't even know the array module exists.

In closing, here is something worth trying/thinking about. _Sparse matrices_ are defined as matrices
whose storage complexity is proportional to the number of non-zero entries it contains. Suppose you wanted to build a $(n \times n)$ [sparse matrix](https://en.wikipedia.org/wiki/Sparse_matrix) $M$ from a [generator](https://peps.python.org/pep-0255/) $f$ whose size is unknown and which on evaluation yields a 3-tuple of the form $(i,j,x)$, where:

- $i$, $j$ are unsigned integers (each $<n$) specifing the a position of a non-zero value in $M$
- $x$ is the non-zero value (say, a float) to go in position $M[i,j]$

How would you go about constructing such a data structure efficiently? How are sparse matrices represented in memory in the first place?

Hint: consider the 'coordinate' format of a sparse matrix used by [SciPy](https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.coo_array.html#scipy.sparse.coo_array):

```python
from scipy.sparse import coo_array
f = ... # some iterable returning triplets
n = 100
I, J, X = np.array([]), np.array([]), np.array([])
for (i,j,x) in f:
  I.append(i)
  J.append(j)
  X.append(x)
M = coo_array((X, (I, J)), shape=(n,n))
```

Do you see anything inherently inefficient with this method of matrix creation?
