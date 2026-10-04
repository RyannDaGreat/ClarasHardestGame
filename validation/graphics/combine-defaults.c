/* Exact desktop GL default-combiner regression; no game-specific rendering. */
#include <GL/gl.h>
#include <gl4esinit.h>
#include <emscripten/html5.h>
#include <stdio.h>
#include <stddef.h>
void *emscripten_GetProcAddress(const char *name);
static void framebuffer_size(int *w,int *h) { emscripten_get_canvas_element_size("#canvas",w,h); }
typedef struct {float xyz[3],uv[2],uv2[2];unsigned char rgba[4];float tangent[4],normal[3];short flag,soft;unsigned unit,index;} Vertex;
int main(void) {
 EmscriptenWebGLContextAttributes a;emscripten_webgl_init_context_attributes(&a);
 a.alpha=0;a.antialias=0;a.majorVersion=1;a.preserveDrawingBuffer=1;
 EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context=emscripten_webgl_create_context("#canvas",&a);
 if(context<=0 || emscripten_webgl_make_context_current(context)!=EMSCRIPTEN_RESULT_SUCCESS)return 1;
 emscripten_set_canvas_element_size("#canvas",1920,1080);
 set_getprocaddress(emscripten_GetProcAddress);set_getmainfbsize(framebuffer_size);initialize_gl4es();
 glViewport(0,0,1920,1080);glClearColor(0,0,0,1);glClear(GL_COLOR_BUFFER_BIT);
 glMatrixMode(GL_PROJECTION);glLoadIdentity();glOrtho(0,1920,0,1080,-1,1);glMatrixMode(GL_MODELVIEW);glLoadIdentity();
 GLint rgb,alpha;glGetTexEnviv(GL_TEXTURE_ENV,GL_COMBINE_RGB,&rgb);glGetTexEnviv(GL_TEXTURE_ENV,GL_COMBINE_ALPHA,&alpha);
 GLuint texture;glGenTextures(1,&texture);glBindTexture(GL_TEXTURE_2D,texture);
 unsigned char texel[4]={255,255,255,128};glTexImage2D(GL_TEXTURE_2D,0,GL_RGBA,1,1,0,GL_RGBA,GL_UNSIGNED_BYTE,texel);
 glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_NEAREST);glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_NEAREST);glEnable(GL_TEXTURE_2D);
 Vertex v[4]={0};unsigned short indices[]={0,1,2,3};
 for(int i=0;i<4;i++){v[i].xyz[0]=(i==1||i==2)?580:60;v[i].xyz[1]=(i>=2)?950:130;v[i].rgba[0]=64;v[i].rgba[1]=160;v[i].rgba[2]=32;v[i].rgba[3]=128;}
 glEnableClientState(GL_VERTEX_ARRAY);glEnableClientState(GL_TEXTURE_COORD_ARRAY);glEnableClientState(GL_COLOR_ARRAY);
 glVertexPointer(3,GL_FLOAT,sizeof(Vertex),v[0].xyz);glTexCoordPointer(2,GL_FLOAT,sizeof(Vertex),v[0].uv);glColorPointer(4,GL_UNSIGNED_BYTE,sizeof(Vertex),v[0].rgba);
 glTexEnvi(GL_TEXTURE_ENV,GL_TEXTURE_ENV_MODE,GL_COMBINE);
 unsigned char pixels[3][4];
 for(int i=0;i<3;i++) {
  if(i>0){glTexEnvi(GL_TEXTURE_ENV,GL_COMBINE_RGB,i==1?GL_MODULATE:GL_REPLACE);glTexEnvi(GL_TEXTURE_ENV,GL_COMBINE_ALPHA,i==1?GL_MODULATE:GL_REPLACE);}
  glDrawElements(GL_QUADS,4,GL_UNSIGNED_SHORT,indices);glFinish();glReadPixels(320+i*640,540,1,1,GL_RGBA,GL_UNSIGNED_BYTE,pixels[i]);glTranslatef(640,0,0);
 }
 GLenum err=glGetError();int ok=rgb==GL_MODULATE && alpha==GL_MODULATE && err==0;
 for(int i=0;i<3;i++){printf("column%d RGBA %d %d %d %d\n",i,pixels[i][0],pixels[i][1],pixels[i][2],pixels[i][3]);if(i<2)ok=ok && pixels[i][0]==64 && pixels[i][1]==160 && pixels[i][2]==32;else ok=ok && pixels[i][0]==255;}
 printf("COMBINE_DEFAULTS_%s rgb=%d alpha=%d stride=%lu rgba_offset=%lu error=%d\n",ok?"PASS":"FAIL",rgb,alpha,(unsigned long)sizeof(Vertex),(unsigned long)offsetof(Vertex,rgba),err);
 return ok?0:1;
}
