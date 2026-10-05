/* Reforged JSON assembly before original Blender conversion. GPL-2.0-or-later. */
#include <Python.h>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <cstddef>
#include <cfloat>
#include <climits>
#include <cstdlib>
#include <cerrno>
#include <map>
#include <set>
#include <string>
#include <vector>
extern "C" {
#include "MEM_guardedalloc.h"
#include "BLI_blenlib.h"
#include "BKE_global.h"
#include "BKE_main.h"
#include "BKE_object.h"
#include "BKE_scene.h"
#include "BKE_mesh.h"
#include "BKE_customdata.h"
#include "BKE_sca.h"
#include "BKE_property.h"
#include "BKE_ipo.h"
#include "DNA_object_types.h"
#include "DNA_scene_types.h"
#include "DNA_mesh_types.h"
#include "DNA_meshdata_types.h"
#include "DNA_sensor_types.h"
#include "DNA_controller_types.h"
#include "DNA_actuator_types.h"
#include "DNA_property_types.h"
#include "DNA_ipo_types.h"
#include "DNA_curve_types.h"
}
namespace {
struct Field { const char *type, *name; size_t offset; char kind; int count; const char *target; };
#include "reforged-fields.inc"
typedef std::map<std::string, Object*> Objects;
static bool fail(const std::string &message) {
    PyErr_SetString(PyExc_ValueError, message.c_str()); return false;
}
static PyObject *item(PyObject *object, const char *key) {
    if (!object || !PyDict_Check(object)) { fail("Expected JSON object"); return NULL; }
    return PyDict_GetItemString(object, key);
}
static std::string string(PyObject *value) {
    if (!value) { fail("Missing required string"); return ""; }
    if (PyString_Check(value)) return PyString_AsString(value);
    if (PyUnicode_Check(value)) {
        PyObject *encoded = PyUnicode_AsUTF8String(value);
        if (!encoded) return "";
        std::string result = PyString_AsString(encoded); Py_DECREF(encoded); return result;
    }
    fail("Expected string"); return "";
}
static bool vector3(PyObject *value, float *out) {
    if (!value || !PyList_Check(value) || PyList_Size(value)!=3) return fail("Expected three coordinates");
    for (int i=0;i<3;i++) {
        double x=PyFloat_AsDouble(PyList_GetItem(value,i));
        if (PyErr_Occurred() || (!std::isfinite(x)||std::fabs(x)>FLT_MAX)) return fail("Coordinates must be finite numbers");
        out[i]=x;
    }
    return true;
}
static const Field *field(const std::string &type, const std::string &name) {
    for (size_t i=0;i<sizeof(fields)/sizeof(fields[0]);i++)
        if (type==fields[i].type && name==fields[i].name) return &fields[i];
    return NULL;
}
static ID *findId(const std::string &name, const char *type, Objects &objects) {
    if (!strcmp(type,"Object")) {
        if(name.size()>1 && name[0]=='@') {
            for(Object *ob=(Object*)G.main->object.first;ob;ob=(Object*)ob->id.next)
                if(name.substr(1)==ob->id.name)return &ob->id;
            return NULL;
        }
        Objects::iterator it=objects.find(name);
        if (it!=objects.end()) return &it->second->id;
        return NULL;
    }
    ListBase *list=!strcmp(type,"Mesh")?&G.main->mesh:!strcmp(type,"Scene")?&G.main->scene:&G.main->sound;
    for (ID *id=(ID*)list->first;id;id=(ID*)id->next) if(name==id->name) return id;
    return NULL;
}
static bool setFields(void *data, const std::string &type, PyObject *settings, Objects &objects, bool references=false) {
    if (!settings) return true;
    if (!data || !PyDict_Check(settings)) return fail("Settings require a matching original data block");
    PyObject *key,*value; Py_ssize_t position=0;
    while(PyDict_Next(settings,&position,&key,&value)) {
        std::string name=string(key); const Field *f=field(type,name);
        if((type=="bSensor"||type=="bController"||type=="bActuator") && (name=="type"||name=="otype"||name=="name"))return fail("Brick identity is fixed by its template");
        if (!f || (f->kind=='P')!=references) return fail("Unsupported field: "+type+"."+name);
        char *address=(char*)data+f->offset;
        if (f->kind=='P') {
            ID *target=value==Py_None?NULL:findId(string(value),f->target,objects);
            if (value!=Py_None && !target) return fail("Connection target not found: "+string(value));
            memcpy(address,&target,sizeof(target));
        } else if (f->kind=='S') {
            std::string text=string(value);
            if (text.size()>=(size_t)f->count) return fail("Text exceeds original field capacity: "+name);
            memset(address,0,f->count); memcpy(address,text.data(),text.size());
        } else {
            if (f->count>1 && (!PyList_Check(value)||PyList_Size(value)!=f->count)) return fail("Incorrect field array length: "+name);
            for(int i=0;i<f->count;i++) {
                PyObject *number=f->count==1?value:PyList_GetItem(value,i);
                if(f->kind=='F') {
                    double x=PyFloat_AsDouble(number);
                    if((!std::isfinite(x)||std::fabs(x)>FLT_MAX)) return fail("Nonfinite field: "+name);
                    ((float*)address)[i]=x;
                } else {
                    long x=PyInt_AsLong(number);
                    if(f->kind=='I') ((int*)address)[i]=x;
                    else if(f->kind=='H') { if(x<-32768 || x>32767)return fail("Short field out of range"); ((short*)address)[i]=x; }
                    else { if(x<-128 || x>255)return fail("Byte field out of range"); address[i]=x; }
                }
                if(PyErr_Occurred()) return false;
            }
        }
    }
    return !PyErr_Occurred();
}
static void *brick(Object *object, const std::string &kind, const std::string &name) {
    if(kind=="sensors") {for(bSensor *b=(bSensor*)object->sensors.first;b;b=b->next)if(name==b->name)return b;}
    if(kind=="controllers") {for(bController *b=(bController*)object->controllers.first;b;b=b->next)if(name==b->name)return b;}
    if(kind=="actuators") {for(bActuator *b=(bActuator*)object->actuators.first;b;b=b->next)if(name==b->name)return b;}
    return NULL;
}
static void *resolveBrick(const std::string &path, const std::string &expected, Objects &objects) {
    size_t a=path.find('/'),b=path.find('/',a+1);
    if(a==std::string::npos || b==std::string::npos || path.substr(a+1,b-a-1)!=expected) {fail("Invalid logic link: "+path);return NULL;}
    Objects::iterator it=objects.find(path.substr(0,a));
    if(it==objects.end()) {fail("Link object not found: "+path);return NULL;}
    void *result=brick(it->second,expected,path.substr(b+1));
    if(!result) fail("Link brick not found: "+path);
    return result;
}
static bool applyLogic(Object *object, PyObject *logic, Objects &objects) {
    const char *kinds[]={"sensors","controllers","actuators"};
    const char *types[]={"bSensor","bController","bActuator"};
    for(int k=0;k<3;k++) {
        PyObject *entries=item(logic,kinds[k]);
        if(!entries || !PyList_Check(entries))return fail("Missing logic list");
        ListBase *original=k==0?&object->sensors:k==1?&object->controllers:&object->actuators;
        if(PyList_Size(entries)!=BLI_countlist(original))return fail("Every original logic brick must appear exactly once");
        std::set<std::string> names;
        for(Py_ssize_t i=0;i<PyList_Size(entries);i++) {
            PyObject *entry=PyList_GetItem(entries,i);
            std::string name=string(item(entry,"name"));
            if(!names.insert(name).second)return fail("Duplicate logic brick: "+name);
            void *target=brick(object,kinds[k],name);
            if(!target)return fail("Original template brick not found");
            if(!setFields(target,types[k],item(entry,"settings"),objects))return false;
            if(k!=1 && item(entry,"payload")) {
                void *payload=k==0?((bSensor*)target)->data:((bActuator*)target)->data;
                std::string type=string(item(entry,"payloadType"));
                // JSON may edit only the payload type belonging to this original brick.
                int code=k==0?((bSensor*)target)->type:((bActuator*)target)->type;
                extern const char *payloadType(int,int);
                const char *expected=payloadType(k,code);
                if(!expected || type!=expected)return fail("Payload type does not match original brick");
                if(!setFields(payload,type,item(entry,"payload"),objects) || !setFields(payload,type,item(entry,"references"),objects,true))return false;
            }
            if(k<2) {
                PyObject *links=item(entry,"links");
                if(!links || !PyList_Check(links) || PyList_Size(links)>32767)return fail("Invalid logic links");
                int count=PyList_Size(links);
                void **pointers=count?(void**)MEM_callocN(count*sizeof(void*),"Reforged links"):NULL;
                for(int j=0;j<count;j++) {
                    pointers[j]=resolveBrick(string(PyList_GetItem(links,j)),k==0?"controllers":"actuators",objects);
                    if(!pointers[j])return false;
                }
                if(k==0) {bSensor *s=(bSensor*)target;if(s->links)MEM_freeN(s->links);s->links=(bController**)pointers;s->totlinks=count;}
                else {bController *c=(bController*)target;if(c->links)MEM_freeN(c->links);c->links=(bActuator**)pointers;c->totlinks=count;}
            }
        }
    }
    return true;
}
#include "reforged-payloads.inc"
static bool applyAnimation(Object *object, PyObject *animation) {
    if(!animation)return true;
    if(!object->ipo)return fail("Animation requires an original IPO template");
    PyObject *curves=item(animation,"curves");
    if(!curves||!PyList_Check(curves)||PyList_Size(curves)!=BLI_countlist(&object->ipo->curve))return fail("Animation curve layout differs from template");
    object->ipo=copy_ipo(object->ipo);
    IpoCurve *curve=(IpoCurve*)object->ipo->curve.first;
    for(Py_ssize_t i=0;i<PyList_Size(curves);i++,curve=curve->next) {
        PyObject *entry=PyList_GetItem(curves,i),*channel=item(entry,"channel"),*points=item(entry,"points");
        if(!channel||PyInt_AsLong(channel)!=curve->adrcode)return fail("Animation channel differs from template");
        if(!points||!PyList_Check(points)||PyList_Size(points)!=curve->totvert||!curve->bezt)return fail("Animation key layout differs from template");
        PyObject *mode=item(entry,"interpolation"),*extrap=item(entry,"extrapolation");
        if(!mode||!extrap)return fail("Animation requires interpolation and extrapolation");
        long interpolation=PyInt_AsLong(mode),extrapolation=PyInt_AsLong(extrap);
        if(PyErr_Occurred()||interpolation<0||interpolation>2||extrapolation<0||extrapolation>3)return fail("Unsupported animation mode");
        curve->ipo=interpolation;curve->extrap=extrapolation;
        for(int j=0;j<curve->totvert;j++) {
            PyObject *point=PyList_GetItem(points,j);
            if(!PyList_Check(point)||PyList_Size(point)!=9)return fail("Animation key requires three XYZ handles");
            for(int k=0;k<9;k++) {
                double value=PyFloat_AsDouble(PyList_GetItem(point,k));
                if(PyErr_Occurred()||!std::isfinite(value)||std::fabs(value)>FLT_MAX)return fail("Invalid animation coordinate");
                curve->bezt[j].vec[k/3][k%3]=value;
            }
            if(j&&curve->bezt[j].vec[1][0]<=curve->bezt[j-1].vec[1][0])return fail("Animation key times must increase");
        }
    }
    return true;
}
static bool applyMesh(Object *object, PyObject *geometry) {
    if(!geometry)return true;
    if(object->type!=OB_MESH || !object->data)return fail("Geometry requires an original mesh");
    Mesh *original=(Mesh*)object->data;
    Mesh *mesh=copy_mesh(original); object->data=mesh;
    PyObject *vertices=item(geometry,"vertices");
    PyObject *faces=item(geometry,"faces");
    if(faces) {
        if(!vertices||!PyList_Check(vertices)||!PyList_Check(faces))return fail("New topology requires vertices and faces");
        int nv=PyList_Size(vertices),nf=PyList_Size(faces);
        if(nv<3||nv>100000||nf<1||nf>100000)return fail("Mesh topology size out of range");
        CustomData_free(&mesh->vdata,mesh->totvert);
        CustomData_free(&mesh->edata,mesh->totedge);
        CustomData_free(&mesh->fdata,mesh->totface);
        mesh->totvert=nv;mesh->totedge=0;mesh->totface=nf;
        CustomData_add_layer(&mesh->vdata,CD_MVERT,CD_CALLOC,NULL,nv);
        CustomData_copy(&original->fdata,&mesh->fdata,CD_MASK_MESH,CD_CALLOC,nf);
        mesh_update_customdata_pointers(mesh);
        for(int i=0;i<nf;i++) {
            PyObject *face=PyList_GetItem(faces,i),*indices=item(face,"vertices"),*source=item(face,"templateFace");
            if(!source||!indices||!PyList_Check(indices))return fail("Face requires indices and original templateFace");
            long index=PyInt_AsLong(source);int count=PyList_Size(indices);
            if(PyErr_Occurred()||index<0||index>=original->totface||(count!=3&&count!=4))return fail("Invalid face template or polygon size");
            CustomData_copy_data(&original->fdata,&mesh->fdata,index,i,1);
            unsigned int *out=&mesh->mface[i].v1;
            for(int j=0;j<count;j++) {
                long vertex=PyInt_AsLong(PyList_GetItem(indices,j));
                if(PyErr_Occurred()||vertex<0||vertex>=nv||(j==3&&vertex==0))return fail("Invalid polygon vertex index");
                out[j]=vertex;
            }
            if(count==3)out[3]=0;
            PyObject *uv=item(face,"uv");
            if(uv) {
                if(!mesh->mtface||!PyList_Check(uv)||PyList_Size(uv)!=count)return fail("Invalid face UVs");
                for(int j=0;j<count;j++) {
                    PyObject *pair=PyList_GetItem(uv,j);
                    if(!PyList_Check(pair)||PyList_Size(pair)!=2)return fail("UV needs two coordinates");
                    for(int k=0;k<2;k++) {
                        double x=PyFloat_AsDouble(PyList_GetItem(pair,k));
                        if(PyErr_Occurred()||(!std::isfinite(x)||std::fabs(x)>FLT_MAX))return fail("Invalid UV coordinate");
                        mesh->mtface[i].uv[j][k]=x;
                    }
                }
            }
        }
    }
    if(vertices) {
        if(!PyList_Check(vertices)||PyList_Size(vertices)!=mesh->totvert)return fail("Mesh vertex count differs from template");
        for(int i=0;i<mesh->totvert;i++)if(!vector3(PyList_GetItem(vertices,i),mesh->mvert[i].co))return false;
        mesh_calc_normals(mesh->mvert,mesh->totvert,mesh->mface,mesh->totface,NULL);
    }
    PyObject *disabled=item(geometry,"disabledFaces");
    if(disabled) {
        if(!PyList_Check(disabled)||!mesh->mtface)return fail("Face carving requires textured original mesh");
        for(Py_ssize_t i=0;i<PyList_Size(disabled);i++) {
            long index=PyInt_AsLong(PyList_GetItem(disabled,i));
            if(PyErr_Occurred()||index<0||index>=mesh->totface)return fail("Face index out of range");
            mesh->mtface[index].mode=(mesh->mtface[index].mode|TF_INVISIBLE)&~TF_DYNAMIC;
        }
    }
    // Recalculate the bounding box from edited vertices during original conversion.
    if(mesh->bb){MEM_freeN(mesh->bb);mesh->bb=NULL;}
    if(object->bb){MEM_freeN(object->bb);object->bb=NULL;}
    return true;
}
}

bool applyReforgedLevel(const char *path) {
    FILE *file=fopen(path,"rb");
    if(!file)return fail(std::string("Level JSON not found: ")+path);
    std::string bytes;char buffer[8192];size_t n;
    while((n=fread(buffer,1,sizeof(buffer),file)))bytes.append(buffer,n);
    bool readError=ferror(file);fclose(file);if(readError)return fail("Cannot read level JSON");
    PyObject *json=PyImport_ImportModule("json");if(!json)return false;
    PyObject *level=PyObject_CallMethod(json,(char*)"loads",(char*)"s",bytes.c_str());Py_DECREF(json);
    if(!level)return false;
    PyObject *version=item(level,"version");
    if(string(item(level,"format"))!="reforged" || !version || !PyInt_Check(version) || PyInt_AsLong(version)!=1)return fail("Unsupported Reforged format/version");
    if(string(item(level,"scene"))!=G.scene->id.name+2)return fail("Level template scene mismatch");
    PyObject *entries=item(level,"objects");
    if(!entries||!PyList_Check(entries)||PyList_Size(entries)>10000)return fail("Invalid object list");
    int inactiveLayer=0;
    for(int bit=19;bit>=0;bit--)if(!(G.scene->lay&(1<<bit))){inactiveLayer=1<<bit;break;}
    if(!inactiveLayer)return fail("Template scene has no unused layer for inactive components");
    Objects originals,objects;
    for(Object *ob=(Object*)G.main->object.first;ob;ob=(Object*)ob->id.next)originals[ob->id.name]=ob;
    clear_sca_new_poins();
    for(Py_ssize_t i=0;i<PyList_Size(entries);i++) {
        PyObject *entry=PyList_GetItem(entries,i);std::string id=string(item(entry,"id")),source=string(item(entry,"source"));
        if(id.size()<3 || id.substr(0,2)!="OB" || id.size()>=sizeof(((Object*)0)->id.name) || id.find('/')!=std::string::npos || objects.count(id))return fail("Invalid or duplicate object ID: "+id);
        Objects::iterator templateObject=originals.find(source);
        if(templateObject==originals.end())return fail("Unknown object template: "+source);
        Object *copy=copy_object(templateObject->second);strcpy(copy->id.name,id.c_str());objects[id]=copy;
    }
    // All connections below are explicit JSON IDs, including duplicated hierarchy members.
    ListBase bases={NULL,NULL};G.scene->base=bases;
    for(Py_ssize_t i=0;i<PyList_Size(entries);i++) {
        PyObject *entry=PyList_GetItem(entries,i);Object *ob=objects[string(item(entry,"id"))];
        if(!vector3(item(entry,"position"),ob->loc)||!vector3(item(entry,"rotation"),ob->rot)||!vector3(item(entry,"scale"),ob->size))return false;
        PyObject *parent=item(entry,"parent");
        if(!parent)return fail("Missing parent (use null for root)");
        ob->parent=parent==Py_None?NULL:(Object*)findId(string(parent),"Object",objects);
        if(parent!=Py_None&&!ob->parent)return fail("Parent not found");
        std::set<Object*> ancestry;
        for(Object *p=ob;p;p=p->parent)if(!ancestry.insert(p).second)return fail("Cyclic object hierarchy");
        PyObject *active=item(entry,"active");if(!active||!PyBool_Check(active))return fail("Active must be boolean");
        ob->lay=active==Py_True?G.scene->lay:inactiveLayer;
        Base *base=scene_add_base(G.scene,ob);base->lay=ob->lay;
        BLI_remlink(&G.scene->base,base);BLI_addtail(&G.scene->base,base);
        if(!applyLogic(ob,item(entry,"logic"),objects)||!applyMesh(ob,item(entry,"geometry"))||!applyAnimation(ob,item(entry,"animation")))return false;
        PyObject *properties=item(entry,"properties");
        if(properties) {
            if(!PyDict_Check(properties))return fail("Properties must be an object");
            PyObject *key,*value;Py_ssize_t p=0;
            while(PyDict_Next(properties,&p,&key,&value)) {
                std::string name=string(key),text=string(value);bProperty *property=(bProperty*)ob->prop.first;
                while(property && name!=property->name)property=property->next;
                if(!property)return fail("Unknown template property: "+name);
                if(PyErr_Occurred())return false;
                if(property->type==PROP_STRING) {
                    if(text.size()>=MAX_PROPSTRING)return fail("Property string exceeds original capacity");
                } else if(property->type==PROP_BOOL && (text=="true"||text=="false")) {
                    // These two original boolean spellings are accepted directly.
                } else {
                    char *end=NULL;errno=0;
                    if(property->type==PROP_INT||property->type==PROP_BOOL) {
                        long value=strtol(text.c_str(),&end,10);
                        if(errno||value<INT_MIN||value>INT_MAX)return fail("Integer property out of range");
                    } else {
                        double value=strtod(text.c_str(),&end);
                        if(errno||!std::isfinite(value)||std::fabs(value)>FLT_MAX)return fail("Float property out of range");
                    }
                    if(end==text.c_str()||*end)return fail("Property needs a complete numeric value");
                }
                set_property(property,const_cast<char*>(text.c_str()));
            }
        }
    }
    G.scene->camera=(Object*)findId(string(item(level,"camera")),"Object",objects);
    if(!G.scene->camera || G.scene->camera->type!=OB_CAMERA)return fail("A valid camera is required");
    clear_sca_new_poins();
    printf("REFORGED_ASSEMBLED %ld original-template objects for %s\n",(long)objects.size(),G.scene->id.name+2);
    Py_DECREF(level);
    return !PyErr_Occurred();
}
