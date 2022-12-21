
If you're gut instinct is that hash maps have $O(1)$ access time, you may want to review your data structure notes. Hash 


Note hash() truncates the value returned from an object’s custom __hash__() method to the size of a Py_ssize_t. This is typically 8 bytes on 64-bit builds and 4 bytes on 32-bit builds. If an object’s __hash__() must interoperate on builds of different bit sizes, be sure to check the width on all supported builds. An easy way to do this is with python -c "import sys; print(sys.hash_info.width)".