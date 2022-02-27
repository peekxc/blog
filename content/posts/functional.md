---
title: "Is C++ a Functional Programming Language?"
author: "Matt Piekenbrock"
date: '2017-03-01'
slug: cpp_functional
include_toc: true
data: { categories: ["C++"], tags: ["post"] }
categories: ["C++"]
tags: ["post"]
output: 
  blogdown::html_page:
    keep_md: TRUE
    self_contained: FALSE
layout: single.pug
draft: true 
--- 

# Functional Programming 

What is a functional programming (FP) language? Definitions vary. Here are a few: 

- A FP languages is any language which has a wealth of support for things typically associated with the FP paradigm
- A FP language typically involving composing **pure functions**, avoiding **shared state,** **mutable data,** and **side-effects**. 
- A FP language is sometimes also defined as a language which treats functions as _first-class citizens_

FP is sometimes considerd a _declarative_ style of programming, because the program logic is expressed through the compositions of pure functions, which transform values into new values, rather than constantly updating the internal state of existing variables (e.g. as one might in the OOP paradigm with member fields).

Consider the 3rd definition of a FP language in the list above, as it is the explicit. Generally, a language that treats a type $T$ as a *first-class citizen* means essentially that the language has mechanisms supporting the use of $T$ types in ways similar to its support for its native types. For example, in C an `int` is a native type which one can do just about anything you want with at the language level (e.g. you can make `int` variables, pass `int&` references, create `int*` pointers, etc.). Stricter definitions of first-class citizens require said types to be passable as arguments to functions, returnable from function calls, and assignable to variables. Thus, a FP language by definition (3) is just a language that supports some notion of a `function` type *natively*.

Under this definition, Python qualifies as a FP language as it supports functions as first-class citizens: 

```python
def add(x, y): return(x + y)
def mul(x,y): return(x * y)

def eval_binary(a, b, f):
  return(f(a,b))

my_binary_op = add
eval_binary(4,5,my_binary_op)
# 9 

my_binary_op = mul
eval_binary(4,5,my_binary_op)
# 20
```

You can do imitate this with function pointers in C via something like: 

```cpp
double add(double x, double y){ return(x + y); }
double mul(double x, double y){ return(x * y); }

double eval_binary(double a, double b, double (*f)(double, double)){
  return (*f)(a,b);
}
```
One can either pass pointers to the function definitions directly or more generically via a variable assignment:  
```cpp
  double (*my_binary_op)(double, double); 
  
  my_binary_op = add;
  eval_binary(4,5,my_binary_op);
  // => 9 
  
  my_binary_op = mul;
  eval_binary(4,5,my_binary_op);
  // => 20
```

This sparks the following question: *does C qualify as full fledged FP language under the above first-class-citizen definition?*

This article is dedicated to answering this question, and to introducing a few basic ideas of FP along the way. It is by no means comprehensive as general FP is a large topic area. 

It may seem strange to interweave code examples written in Python with ones written in C++: these are two very different after all! Nonetheless, I conjecture understanding the nuances between how _functions_ are implemented between these two languages illustrates nicely what is it really means to be a first class citizen. It also demonstrates quite nicely how far we've come as a society with the newest version of C++ at masking machine-level constraints with abstraction.   


# Basic Functional Programming Concepts

Here are many of the terms tossed around in FP: 

- **Higher-Order Functions** a function that accepts another function as an argument.
- **Closure** A function which _encloses_ an *environment*. An *environment* is just a data structure that binds _symbols_ to *values*. 
- **Currying** the process of transforming a function that takes multiple arguments into a function that takes just a single argument and returns another function if any arguments are still needed. Not to be confused with *partial function application*.  
- **Pure Functions** a function that does not enact _side effects_. Since pure function cannot mutate the state of its arguments, they must return a value--otherwise they are useless. 
- **Functors** [in the context of FP](https://stackoverflow.com/questions/2030863/in-functional-programming-what-is-a-functor), a functor is a container of type *a* that, when subjected to a function that maps from *a* → *b*, yields a container of type *b*. Replacing the words *container*, *type*, and *function* with the words *category*, *object*, and *morphism* yields a similar definition  of a functor in category theory. 
- **Monad** A monad is just a [monoid in the category of endofunctors](https://stackoverflow.com/questions/3870088/a-monad-is-just-a-monoid-in-the-category-of-endofunctors-whats-the-problem). They enable things like the functional mutation of state in ways that adhere to FP principles. Understanding monads is a [like a spiritual experience](https://bartoszmilewski.com/2011/01/09/monads-for-the-curious-programmer-part-1/) that must be taken alone.   
- **Immutable** A variable is *immutable* if its value cannot change once its instantiated. In pure FP languages, all variables are immutable.
- **Tail recursion** A type of recursion wherein there is one recursive call whose result is left unmodified at the end of the body fo the recursive function (the tail), and the recursive call is the last operation to occur

There are many other basic terms one needs to be familiar with, including *memoization*, [nullary/unary/binary/ternary] *functions*, *predicates*, delayed or "*lazy*" evaluation, *lambdas*, *y-combinators*, etc.

## Higher order functions and Closures

A higher order function is a function that accepts a function as an argument. Thus, a programming language is not functional it does not support higher order, since part of the definition of a function being a first-class citizens is that it can be passed as an argument to a function.  We've already defined the higher order function `eval_binary`, which takes two numbers `a` and `b` and binary function `f` as input: 

```python
def eval_binary(a, b, f):
  return(f(a,b))
```

In the above code, `def` was to define a _named_ function. A more compact style of defining a function is to define an *anonymous* *function*, or *lambda function*. 

```python
lambda a,b,f: f(a,b)
```

Note there is no `return` statement needed for `lambda` functions; its implicit in the last evaluated expression. Since Python treats functions as first class citizens, both named functions and lambas can be assigned to variables:

```python
g = lambda a,b,f: f(a,b)
```

Although the lambda is bound to the symbol `g` and thus can be referred to by name, in general people will still refer to `lambda` functions as "anonymous." 

In most languages, there are subtle differences between anonymous functions and named functions. For example [in Python](https://stackoverflow.com/questions/12264834/what-is-the-difference-for-python-between-lambda-and-regular-function), a `lambda` expression is an expression which evaluates to a function object, while a `def` statement has no value: its creates a function object and binds it to a name. Moreover, `lambda` definitions are limited to single expressions. 

A common example of a popular higher-order function is `map` and `reduce`. `map(f, iter)` takes as input a function `f` which it applies to every element along an iterable `it`. It then returns an iterable `map` object which can be enumerated to store as an explicit collection. For example:  

```python
map(lambda x: x**2, [1, 2, 3, 4, 5])
# => <map object at 0x7ffe66b26dc0>

list(map(lambda x: x**2, [1, 2, 3, 4, 5]))
# => [1, 4, 9, 16, 25]

tuple(map(lambda x: x**2, [1, 2, 3, 4, 5]))
# => (1, 4, 9, 16, 25)

dict(map(lambda x: (x, x**2), [1, 2, 3, 4, 5]))
# => {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
```

Sometimes its useful to have the function maintain an internal state. A *closure* is a function that does just this: it encapsulates its own lexical scope. Closures are typically constructed using the *factory pattern*. 

```python
def cyclic_counter(n):
  c = 0
  def increment(i=1):
    nonlocal c
    c = (c + i) % n
    return(c)
  return(increment)

counter = cyclic_counter(10)

counter()
# => 1

counter()
# => 2

counter(10)
# => 12
```

Notice that the keyword `nonlocal` was used to denote the variable from the outer (enclosing) scope is writable. In contrast, since `n` is constant, it is available without the `nonlocal` keyword designation. See for [this post](https://stackoverflow.com/questions/4020419/why-arent-python-nested-functions-called-closures) and [this post](https://stackoverflow.com/questions/1261875/python-nonlocal-statement) for more information on Python closures and the `nonlocal` keyword. 

---

Functional programming is often distinguished as a distinct alternative from classical *Object Oriented Programming* (OOP), wherein state is modified within the object instance. In Python, a classic OOP to a _modulo n_ counter might be something as follows: 

```python
class CylicCounter:
  def __init__(self, n):
    self.c = 0
    self.n = n
  def increment(i=1):
    self.c = (self.c + i) % self.n
    return(self.c)
  
counter = CyclicCounter(10)
counter.n
```

So whats the difference between [a closure and an object](https://wiki.c2.com/?ClosuresAndObjectsAreEquivalent)? Not much. A closure is a poor mans object, and an object is a poor mans closure. They both encapsulate an environment which contains bindings to mutables values, lexically scoped for each instantation. Despite their similarities, closures are more commonly used and recommended in FP, whereas objects are the bread and butter means of describing program logic in OOP. For example, the language [Clojure]() is a popular FP language whose name was inspired by the use of the *closure* in FP. 

### Detour: Closures in C and C++ 

As shown above, the C language does not natively support closures at all. In C++, the canonical way of representing mutable data is by uses classes under the OOP paradigm. Consider the following pathologicial example of a fictional Dragon who breathes fire on villagers. 

```cpp
class Dragon {  
  const float size; 
  const float height; 
  float fire_temperature; 
public: 
  Dragon(float sz, float h) : size(sz), height(h){
    fire_temperature = 200.0; // in degrees Farenheit
  }
  
  // Increase fire temperature 10 degrees over 'seconds'
  void take_breath(float seconds){
    // the dragon sucks in air, preparing to fire breath
    fire_temperature += seconds*10;
  }
  
  // For every second the dragons rests, his breath temperature drops
  // as before, to a minimum of 200 degrees
  void rest(float seconds){
    fire_temperature -= second*10; 
    fire_temperature = std::max(fire_temperature, 200.0)
  }
  
  // Breathes fire on the villagers
  float breath_fire() const {
    float output_fire = height*size*take_breath(rand() % 10 + 1); 
    return(output_fire);
  }
}

Dragon d = Dragon(7, 9)
int x = int(5)
 
// const auto v = vector< int >{ 1, 2, 3, 4, 5 };
```

Notice that the dragons size and height are constant, but the dragon's temperature is mutated as the dragon rests or takes in a breath. This is the traditional object-oriented way of handling state. In this case, the use of the `class` keyword implies the member fields are `private` by default, whereas the member functions (and the constructor) are part of the public interface. 

You can emulate the semantics of closures in C++ by using *function objects*, short for _functors_. These are unrelated to the category theory and FP definition of a functor. Function objects were made possible in the 1982 release of C++, colloquially now known as the version of C++ called "*C with classes*".  

```cpp
// Estimates 1/sqrt(x)
// From: 1999 implementation of Quake 3: Arena 
// See also: https://www.youtube.com/watch?v=p8u_k2LIZyo
struct FastInvSqrt {
  const float threehalfs = 1.5F;
  
  // FastInvSqrt () { }
  
  float operator()(float x){
    long i;
    float x2, y;
    x2 = number * 0.5F;
    y  = number;
    i  = * ( long * ) &y;                       // evil floating point bit level hacking
    i  = 0x5f3759df - ( i >> 1 );               // what the fuck? 
    y  = * ( float * ) &i;
    y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
    //	y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed
    return y;
  }
}
```

The idea is as follows: the struct defines a class with a default all-public namespace with only one member function, the operator `()`. Once an object is instantiated, the object can be used 

```cpp
auto inv_sqrt = FastInvSqrt();
inv_sqrt(12.5)  
// => ~ 1/sqrt(12.5)
```

Indeed, this object is a full-featured **type**. And C++ supports custom object types as first-class citizens. Thus, we can do the following:

```cpp
float apply_f(float x, FastInvSqrt& f){
  return(f(x));
}

auto inv_sqrt = FastInvSqrt();
float result = apply_f(5.0, inv_sqrt);
```

Does this mean that C++ is a FP language? 

---

Function objects end up being extremely useful for generic programming. For example, suppose you want to sort a container in C++ using the STL library function `std::sort`. 

```cpp
vector< int > v = { 2, 4, 7, 4, 5, 10, 5 };
std::sort(v.begin(), v.end());
// => v = [2, 4, 4, 5, 5, 7, 10]
```

Observe `v` is sorted in ascending order. Suppose you wanted to sort `v` in descending order. How would you implement this?  One option is to add a boolean flag to the `std::sort` function: 

```cpp
void sort(..., bool descending=false){
  ...
}
```

However, this is not the approach taken by the STL. If one looks at the definition `std::sort`, the function signature is as follows:

```cpp
template< class RandomIt, class Compare >
void sort( RandomIt first, RandomIt last, Compare comp );
```

Observe that sort takes a *comparator* as the third argument. Indeed, the default specialization for the `std::sort` above is: 

```cpp
template< class RandomIt, class Compare >
void sort( RandomIt first, RandomIt last, Compare comp = std::less< T >());
```

where the type `T` is deduced from the `value_type` of whatever type is associated with `RandomIt`, and `std::less< T >()` is a function object whose implementation looks something similar to the following:

```cpp
template < typename T >
struct less {
  bool operator()(const T &lhs, const T &rhs) const {
    return lhs < rhs; // assumes that T overloads the < operator
  }
}
```

In the context of `std::sort`, the functor `std::less` is a binary predicate which returns whether the first argument should go before second. Sorting a vector into a ascending order can be easily achieved: 

```cpp
std::sort(v.begin(), v.end(), std::less<int>());
# => v = [2, 4, 4, 5, 5, 7, 10]
std::sort(v.begin(), v.end(), std::greater<int>());
# => v = [10, 7, 5, 5, 4, 4, 2]
```

But `std::sort` can actually sort any container. Consider the following container: 

```cpp
struct Point {
  float x;
  float y;
}
struct less {
  bool operator()(const Point &lhs, const Point &rhs) const {
    if (lhs.x == rhs.x){ return(lhs.y < rhs.y); }
    return lhs.x < rhs.x; 
  }
}
int main(){
  vector< Point > v = { ... };
  
  // How to sort v by the x-coordinates, with the y-coordinate as a tie-breaker?
  std::sort(v.begin(), v.end(), ???);
}
```

---

C++11 introduced the syntax for *Lambdas*, which are effectively anonymous function objects. A more detailed explanation of how the assembly of lambdas differs from functors is described [here](https://web.mst.edu/~nmjxv3/articles/lambdas.html). The basic syntax for a lambda is as follows: 

```cpp
[ captures ] ( params ) { body }
```

The best way to illustrate this is by showing an example:

```cpp
 struct Functor {
   Functor(const int x): m_x(x) {}
 
   int operator()(int a) {
     return a + m_x;
   }
   int m_x;
 };

int main(){
  int x = 3;
  Functor functor(x);
  
  // This is identical to the above functor 
  auto lambda = [x] (int a) { return a + x; };
  
  int y1 = functor(5);
  // => y1 == 8
  
  int y2 = lambda(5);
  // => y2 == 8
  
  return(0);
}
```

With the addition of anonymous lambdas to the C++ language, with a little bit of template programming, the following code is now possible:

```cpp
double add(double x, double y){ return(x + y); }

template< class Function >
double eval_binary(double a, double b, Function f){
  return f(a,b);
}

int main(){
  eval_binary(5.0, 8.0, add);
  // => 13.0
  auto add_lambda = [](double x, double y){
    return(x + y);
  };
  eval_binary(5.0, 8.0, add_lambda);
  // => 13.0
}
```

Does this mean that C++11 is a FP language? 

## Bonus: coroutines 

> A coroutine is a generalisation of a function that allows the function to be suspended and then later resumed 
>
> - Lewis Baker

A function is a group of expressions allocated on a block of memory called an **activation frame** (or, if the memory is allocated on the stack, *stack-frame*), which supports two operations: **Call** and **Return**.  

```python
def peg_alex(size):
  strapon = construct_strapon(size)
  peg(alex, strapon)
```



A coroutine a function that supports three additional operations: **Suspend**, **Resume**, and **Destroy**.

https://lewissbaker.github.io/2017/09/25/coroutine-theory

https://www.scs.stanford.edu/~dm/blog/c++-coroutines.html

## Tail-call recursion

From [wiki](https://en.wikipedia.org/wiki/Tail_call), for more reading. here are some examples/non-examples of (non-recursive) *tail call functions*:

```
function foo1(data) {
    return (data) + 1;
}
function foo2(data) {
    var ret = g(data);
    return ret;
}
function foo3(data) {
    var ret = g(data);
    return (ret == 0) ? 1 : ret;
}
```

**foo1** and **foo3** are not tail-call functions, as both modify the result of calling the function **g**. **foo2** is an example of function with a tail-call. Tail call recursion is important in functional languages. The use of tail-call recursion is sometimes called **tail-call optimization**, because one only needs a constant amount of stack space to call a tail-recursive function. 

For example, here is a non-tail-recursive implementation of the factorial function ( *n!* ): 

```scheme
;; factorial : number -> number
;; Calculates the product of all positive integers less than or equal to n.
(define (factorial n)
 (if (= n 1)
    1
    (* n (factorial (- n 1)))))
```

Upon evaluation, the stack-frame grows as follows: 

```scheme
(fact 4)
(* 4 (fact 3))
(* 4 (* 3 (fact 2)))
(* 4 (* 3 (* 2 (fact 1))))
(* 4 (* 3 (* 2 (* 1 (fact 0)))))
(* 4 (* 3 (* 2 (* 1 1))))
(* 4 (* 3 (* 2 1)))
(* 4 (* 3 2))
(* 4 6)
24
```

A tail recursive solution looks as follows: 

```scheme
;; factorial : number -> number
;; Calculates the product of all positive integers less than or equal to n tail-recursively.
(define (factorial n)
  (fact-iter 1 n))
(define (fact-iter product n)
  (if (< n 2)
      product
      (fact-iter (* product n)
                 (- n 1))))
```

Because of the tail-recursive nature of this function, the interpreter is free to optimize the recursion by **replacing the contents of the existing stack-frame** with the result of inner-most recursion. For example, instead of the stack-frame looking like this: 

```scheme
 call factorial (4)
   call fact-iter (1 4)
    call fact-iter (4 3)
     call fact-iter (12 2)
      call fact-iter (24 1)
      return 24
     return 24
    return 24
   return 24
  return 24
```

The scheme interpreter would continually replace the contents of the existing stack frame  (parameters included!). The resulting tail-recursion would look as follows:

```scheme
 call factorial (4)
   call fact-iter (1 4)
   replace arguments with (4 3)
   replace arguments with (12 2)
   replace arguments with (24 1)
   return 24
  return 24
```

More reading: Look up *thunks*, *trampolining*, *applicative order evaluation*, and *continuation-passing style*. 



## Exercises and Resources to try

Python exercises: https://maryrosecook.com/blog/post/a-practical-introduction-to-functional-programming

 