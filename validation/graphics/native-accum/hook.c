#define _GNU_SOURCE
#include <dlfcn.h>
#include <stdio.h>
#include <stdlib.h>
typedef unsigned int GLenum;
static void *lookup(const char *name) {
    void *fn = dlsym(RTLD_NEXT, name);
    if (!fn) { fprintf(stderr, "NATIVE_ACCUM_LOOKUP_FAILED %s %s\n",name,dlerror()); abort(); }
    return fn;
}
void glAccum(GLenum op, float value) {
    static unsigned int calls;
    static void (*real)(GLenum,float);
    static void (*get)(GLenum,int*);
    static GLenum (*error)(void);
    if (!real) { real=lookup("glAccum"); get=lookup("glGetIntegerv"); error=lookup("glGetError"); }
    if (calls++ < 8) {
        int bits[4]={-1,-1,-1,-1};
        GLenum before=error();
        for (int i=0;i<4;i++) get(0x0D58+i,&bits[i]);
        GLenum query=error();
        real(op,value);
        GLenum after=error();
        fprintf(stderr,"NATIVE_ACCUM call=%u op=%u value=%.9g bits=%d,%d,%d,%d prior_error=%u query_error=%u call_error=%u\n",calls,op,value,bits[0],bits[1],bits[2],bits[3],before,query,after);
    } else real(op,value);
}
void glXSwapBuffers(void *display, unsigned long drawable) {
    static void (*real)(void *,unsigned long);
    static int first=1;
    if(!real) real=lookup("glXSwapBuffers");
    if(first) {
        first=0;
        fprintf(stderr,"NATIVE_ACCUM_FIRST_SWAP diagnostic LOAD follows; subsequentcalls originate game\n");
        glAccum(0x0101,1.0f);
    }
    real(display,drawable);
}
__attribute__((constructor)) static void loaded(void) {fprintf(stderr,"NATIVE_ACCUM_HOOK_LOADED\n");}
