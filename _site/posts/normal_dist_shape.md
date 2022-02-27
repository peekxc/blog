---
title: "Why is the normal distribution bell shaped?"
author: "Matt Piekenbrock"
date: 2017-02-01
categories: ["statistics"]
tags: ["post", "probability", "statistics", "distributions"]
slug: normal-distribution
include_toc: true
layout: single.pug
---

Perhaps the most persistent, random pattern to appear in the universe itself is the normal distribution. The Normal distibution, also called the Gaussian distribution.. 

```cpp
double* add_vec(double* v1, double* v2, int n){
  double* res = malloc(sizeof(double)*n); 
  for (int i = 0; i < n; i++){
    res[i] = v1[i] + v2[i];
  }
  return res; 
}
```

Seem reasonable? Maybe for parallel computing. It’s actually awful though.
It’s up to the caller to deallocate memory manually, even though it’s unclear that memory was even dynamically allocated in the first place. Do we even need heap-allocated memory? A better solution is to rely on `std::vector`, whose deconstructor manages the memory for you (after the vector is returned and goes out of scope, it deconstructs). 2nd attempt:

```cpp
using std::vector; 
vector< double > add_vec(vector< double > v1, vector< double > v2){
  assert(v1.size() == v2.size());
	vector< double > res(v1.size()); 
  for (int i = 0; i < res.size(); i++){
    res.at(i) = v1.at(i) + v2.at(i);
  }
  return res; 
}
```

This is safer, much more STL-like,  and it removes the need for the extra argument. But there are still many things one could improve: for example, the vectors above were passed by-value, which requires two vector copies. Instead should pass them by reference with the ampersand operator ‘&’:

```cpp
using std::vector; 
vector< double > add_vec(vector< double >& v1, vector< double >& v2){
  vector< double > res(v1.size()); 
  for (int i = 0; i < res.size(); i++){
    res.at(i) = v1.at(i) + v2.at(i);
  }
  return res; 
}
```

Actually, the vectors are not modified, so they ought to be const to encourage the compiler to put them in some kind of read-only memory:
```cpp
using std::vector; 
vector< double > add_vec(vector< double > const & v1, vector< double > const & v2){
  vector< double > res(v1.size()); 
  for (int i = 0; i < res.size(); i++){
    res.at(i) = v1.at(i) + v2.at(i);
  }
  return res; 
}
```

It’s considered poor practice to use ‘int’s as loop counters, since that’s a signed type, and it limits how big your vectors can be. Much better is the std::size_t type.
It's portable, more semantically clear, more secure, and most importantly guarenteed by the standard to be big enough for any container. Additionally, as an unsigned type, no bits are wasted (in the int case, the sign bit is meaningless).
```cpp
using std::vector; 
vector< double > add_vec(vector< double > const & v1, vector< double > const & v2){
  vector< double > res(v1.size()); 
  for (size_t i = 0; i < res.size(); i++){
    res.at(i) = v1.at(i) + v2.at(i);
  }
  return res; 
}
```
The “.at()” access method for vectors does bound-checking, which amount to three function calls every loop iteration (!!). Better to check once and do a straight indexing:

```cpp
using std::vector; 
vector< double > add_vec(vector< double > const & v1, vector< double > const & v2){
  assert(v1.size() == v2.size());
  vector< double > res(v1.size()); 
  for (size_t i = 0; i < res.size(); i++){
    res[i] = v1[i] + v2[i];
  }
  return res; 
}
```

Believe it or not, incrementing via i++ used to generate one more instruction than ++i. The former makes a copy and then increments, whereas the latter just returns the final value. See answer #3 of https://stackoverflow.com/questions/24886/is-there-a-performance-difference-between-i-and-i-in-c.
Also, the ‘.size()’ is a function call. Notice it gets called in the conditional every iteration. Better to use a const size_t to store the vector size to encourage getting put into a register.

```cpp
using std::vector; 
vector< double > add_vec(vector< double > const & v1, vector< double > const & v2){
  const size_t n = v1.size(); 
  assert(n == v2.size());
  vector< double > res(n); 
  for (size_t i = 0; i < n; ++i){
    res[i] = v1[i] + v2[i];
  }
  return res; 
}
```

Actually, why even use a counter variable at all? Vectors are guaranteed by the standard to be contiguous. Which means we can just iterate through them via random_access_iterators (which are just incrementeable-pointers to the vectors memory)

```cpp
using std::vector; 
vector< double > add_vec(vector< double > const & v1, vector< double > const & v2){
  assert(v1.size() == v2.size());
  vector< double >::const_iterator it1 = v1.begin(); 
  vector< double >::const_iterator it2 = v2.begin(); 
  vector< double > res(n);
  vector< double >::iterator out = res.begin(); 
  while(it1 != v1.end()){
    *out = *it1 + *it2;
    ++out; ++it1; ++it2; 
  }   
  return res; 
}
```
But that only works for doubles. And maybe your boss wants your to use accept multiple numeric types. So you can copy+paste the function to work with floats and doubles. But then what if someone has their own fancy floating point type? There are many integer types (see https://en.cppreference.com/w/cpp/language/types#Integer_types). And fuck overloading all the possible floating point types.
In modern C++, one can use type traits to assert at compile-time via ‘static_assert’ properties of the compile-type-deduced type ‘T’. See https://en.cppreference.com/w/cpp/types/is_floating_point.  

https://stackoverflow.com/questions/15433381/performance-of-piter-cont-end-in-for-loop

```cpp
using std::vector; 
template< typename T >
vector< T > add_vec(vector< T > const & v1, vector< T > const & v2){
  static_assert(is_floating_point<T>::value, "Must be floating point"); 
  assert(v1.size() == v2.size());
  vector< T >::const_iterator it1 = v1.begin(); 
  vector< T >::const_iterator it2 = v2.begin(); 
  vector< T > res(n);
  vector< T >::iterator out = res.begin(); 
  while(it1 != v1.end()){
    *out = *it1 + *it2;
    ++out; ++it1; ++it2; 
  }   
  return res; 
}
```

Now we have one function that works for any floating point type. But it looks terrible. Can we use the standard library to simplify it without incurring any penalty from the optimized version we have?
Sure can. See the C++ version of mapping: http://www.cplusplus.com/reference/algorithm/transform/


```cpp
template< typename T >
vector< T > add_vec(const vector< T > & v1, const vector< T > & v2){
  static_assert(is_floating_point<T>::value, "Must be floating point"); 
  vector< T > res(v1.size());
  std::transform(v1.begin(), v1.end(), v2.begin(), res.begin(), std::plus< T >());
  return res; 
}
```

The second overload takes three input iterators, an output iterator, and a binary function (templated by the floating point template type), and applies the binary function pairwise to the two input iterators, saving the result to the iterator specified as the output (res). If you look at the equivalent code on the site, this is literally essentially equivalent to the on before, but much less code, and it’s just as efficient.
… But this is still a function call. And from the first link, you saw how expensive setting up function calls can be. It would be better if this code were just copy+pasted everywhere it was called. Luckily you can do that (more-or-less) with inline:

```cpp
using std::vector; 
template< typename T >
inline vector< T > add_vec(vector< T > const & v1, vector< T > const & v2){
  static_assert(is_floating_point<T>::value, "Must be floating point"); 
  vector< T > res(v1.size());
  std::transform(v1.begin(), v1.end(), v2.begin(), res.begin(), std::plus< T >());
  return res; 
}
```

We can follow the tradition of specifying preconditions ([using narrow contracts](http://www.open-std.org/JTC1/SC22/WG21/docs/papers/2015/p0147r0.html#WideNarrow)) to remove the 
assertion and instead declare that if two vectors are given, their sizes must match, otherwise this function produces undefined behavior. 
If we assume the preconditions are always met, the memory accessed should never cause a segmentation fault. That is, it shouldn’t throw any exceptions. So we can append noexcept to tell the compiler to hint that this should be a safe function.

https://stackoverflow.com/questions/7593086/why-use-non-member-begin-and-end-functions-in-c11

```cpp
template< typename T >
inline vector< T > add_vec(const vector< T > & v1, const vector< T > & v2) {
  static_assert(is_floating_point<T>::value, "Must be floating point"); 
  vector< T > res(v1.size());
  transform(begin(v1), end(v1), begin(v2), begin(res), plus< T >());
  return res; 
}
```


```c++
template< typename T > [[nodiscard]] 
auto add_vec(const vector< T > & v1, const vector< T > & v2) noexcept -> vector< T >  {
  static_assert(is_floating_point<T>::value, "Must be floating point"); 
  vector< T > res; res.reserve(v1.size()); 
  transform(begin(v1), end(v1), begin(v2), begin(res), plus< T >());
  return res; 
}
```

So this is pretty good, and it’s short. But now consider an example useage:

```cpp
vector< double > v1 = { 1, 2, 3 };
vector< double > v2 = { 4, 5, 6 };
vector< double > v3 = { 7, 8, 9 };
vector< double > res = add_vec(v3, add_vec(`v1,v2));
```

Ehh…. each ‘add_vec’ allocates a new and returns it, so the last statement allocates two vectors. Currently, if you want to apply n vector additions, you need n vector allocations to happen; but if you replicated something like above function to add up not just two vectors, but n vectors, you could re-implement another function that takes some n vectors and only performs one vector allocation (for the result). How does one do that without making n special vector additions specializations?
We could’ve done the easy solution in the beginning; enact side-effects by passing one by non-const reference and modifying it directly--no copies needed. But screw that, I want a pure function! Challenge to the mind.
Now the final example solution: https://en.wikipedia.org/wiki/Expression_templates.
See the paragraph starting with: “A problem with this approach is that more complicated expressions such as Vec x = a + b + c are implemented inefficiently. The implementation first produces a temporary vector to hold a + b, then produces another vector with the elements of c added in. Even with return value optimization this will allocate memory at least twice and require two loops.”
The idea is to build the expression trees at compile-time to enable delayed evaluation and so-called “loop fusion.”
Also, see the application section at the bottom for the (modern) linear algebra that use this kind of thing. Of course, the vector additions is just one example. Notice that sentence that expression templates are used for “i.e., for dealing with vectors and matrices of numbers”. So everything in scientific computing.
This notion of building compile-time abstract syntax trees to represent complex expressions…. it’s not just some lisp-derived lambda calculus motivated scheme-function mumbo jumbo. It’s a movement that’s shaping the language which enables C++ programmers to create expressive, terse, functional code that is every drop as efficient as the hyper bit-trick optimized old-fortran versions were. But these tricks are general, composable, and are becoming increasingly simpler to implement. And, believe it or not, at the cutting edge of the libraries proposing additions the standard lies extensions inspired by things like category theory (monads are the primary example), algebra (posets are coming in c++20), etc. That is modern C++, and what is emerging with the newer standards.