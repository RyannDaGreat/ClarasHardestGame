/* Desktop GL_QUADS polygon-line semantics: perimeter only, no triangulation edges. */
#include <GL/gl.h>
#include <gl4esinit.h>
#include <emscripten/html5.h>
#include <stdio.h>
void *emscripten_GetProcAddress(const char *name);
static void framebuffer_size(int *w,int *h) { emscripten_get_canvas_element_size("#canvas",w,h); }
int main(void) {
    const int width=1920,height=1080;
    EmscriptenWebGLContextAttributes a;
    emscripten_webgl_init_context_attributes(&a);
    a.alpha=0;a.antialias=0;a.majorVersion=1;a.preserveDrawingBuffer=1;
    EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context=emscripten_webgl_create_context("#canvas",&a);
    if(context<=0 || emscripten_webgl_make_context_current(context)!=EMSCRIPTEN_RESULT_SUCCESS) return 1;
    emscripten_set_canvas_element_size("#canvas",width,height);
    set_getprocaddress(emscripten_GetProcAddress);set_getmainfbsize(framebuffer_size);initialize_gl4es();
    glViewport(0,0,width,height);glClearColor(0,0,0,1);glClear(GL_COLOR_BUFFER_BIT);
    glMatrixMode(GL_PROJECTION);glLoadIdentity();glOrtho(0,width,0,height,-1,1);
    glMatrixMode(GL_MODELVIEW);glLoadIdentity();glColor3f(1,1,1);
    glPolygonMode(GL_FRONT_AND_BACK,GL_LINE);
    glBegin(GL_QUADS);glVertex2f(100,100);glVertex2f(1100,100);glVertex2f(1100,1000);glVertex2f(100,1000);glEnd();
    glFinish();
    unsigned char center[16*16*4],edge[16*16*4];
    glReadPixels(592,542,16,16,GL_RGBA,GL_UNSIGNED_BYTE,center);
    glReadPixels(592,92,16,16,GL_RGBA,GL_UNSIGNED_BYTE,edge);
    int inside=0,boundary=0;
    for(int i=0;i<16*16;i++) { if(center[i*4]) inside++;if(edge[i*4]) boundary++; }
    GLenum error=glGetError();
    printf("WIREFRAME_%s center=%d edge=%d error=%d\n",inside==0 && boundary>0 && error==GL_NO_ERROR?"PASS":"FAIL",inside,boundary,error);
    return inside==0 && boundary>0 && error==GL_NO_ERROR?0:1;
}
