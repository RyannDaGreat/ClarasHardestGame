#include <Python.h>
#include <stdio.h>

int main(void) {
    Py_NoSiteFlag = 1;
    Py_SetPythonHome("/python");
    Py_Initialize();
    int status = PyRun_SimpleString(
        "import sys, math, struct, itertools\n"
        "assert sys.version_info[:3] == (2, 6, 2)\n"
        "assert sum(i*i for i in xrange(10)) == 285\n"
        "assert struct.unpack('<I', struct.pack('<I', 274))[0] == 274\n"
        "assert math.sqrt(81) == 9\n"
        "print 'CPython WASM:', sys.version\n"
        "print 'Python 2.6.2 bytecode and static modules passed'\n");
    Py_Finalize();
    return status != 0;
}
