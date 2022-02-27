---
title: " Getters and Setters are DEAD"
author: "Matt Piekenbrock"
date: 2017-02-01
categories: ["programming"]
tags: ["programming"]
slug: getter_setter
include_toc: true
layout: single.pug
---

## Getters and Setters are DEAD

I remember learning that getter setter pattern vividly. The original idea of the getter / setter pattern was to keep the implementation hidden from the user as much as possible, instead only expose the minimal interface needed to chaneg the member field value. 

Said another way, getters and setters are aimed at providing encapsulation or information hiding. 

A typical use-case is that a getter would provide access to stored member type and a setting would allow mutation. By encapsulating the read/write functionality as functions, one could have finer control over the object properties are used. 

For example, one might provide a `read` function that returns a property, but only if the property is valid, otherwise they might throw an exception. 

Another example illustrates the use of setters--by moving the assignment to a function that you control, one can do stricter argument checking, thereby ensuring the validitiy of the corresponding object instance. 



The motivation behind getters/setters is sound: encapsulation is a good thing. However, far too often what ends up happening (especially in the beginner-level Java code) is that the getters and setters get misused. They can actually hinder the expressiveness of code and make it more difficult for people to actually use their class. Here's an example of what *not* to do: 

```cpp
class PointXYZ {
    float _x, _y, _z;
public:     
    float get_x(){ return(_x); }
    void set_x(float x){ _x = x; }
    float get_y(){ return(_y); }
    void set_y(float y){ _y = y; }
    float get_z(){ return(_z); }
    void set_z(float z){ _z = z; }
}
```

As you can see, this is a very simple class and we've following the getter setter pattern to the tee. But a much simpler and better solution is to just treat it as POD type 



```cpp
struct PointXYZ {
  float x,y,z;
}
```

No fancy constructors, 

The problem, though, is that this is ugly and not necessary at all: there are no restrictions imposed on the internal field values. 

```cpp
template< typename T >
struct Property {
    T value;
    Property(const T initial_value) : value(initial_value) { }
    operator T() { return value; }
    T operator= (T newValue) { return value = newValue; }
};
```

```cpp
struct SetosaPlant {
    Property< int > sepal_length; 
    Property< int > sepal_width; 
}

int main(){
    auto plant = SetosaPlant();
    plant.sepal_length = 5;
    plant.sepal_width = plant.sepal_length;
}
```



```cpp
class SetosaPlant {
    public: 
    // Replace w/ std::optional 
    
    int& sepal_length() {
      return(_sepal_length);
    } 
    SetosaPlant& sepal_length(T new_value) { 
      value = new_value;
      return(*this);
    }
   
    private: 
        int _sepal_length; 
        int _sepal_width; 
}


int main(){
    auto plant = SetosaPlant();
    plant
        .sepal_length(5)
        .sepal_width(plant.sepal_length());
}
```
