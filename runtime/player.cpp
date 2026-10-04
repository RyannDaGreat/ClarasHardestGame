/* Browser platform adapter for Blender 2.49b. Startup follows GPG_Application.cpp.
 * GPL-2.0-or-later, matching the original Blender game player. */
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <set>
#include <emscripten.h>
#include <emscripten/html5.h>
#include <Python.h>
#include "GL/glew.h"
extern "C" {
#include "BLI_blenlib.h"
#include "BLO_readfile.h"
#include "BKE_global.h"
#include "BKE_main.h"
#include "BKE_blender.h"
#include "BKE_node.h"
#include "BKE_icons.h"
#include "DNA_scene_types.h"
#include "GPU_extensions.h"
#include "GEN_messaging.h"
void initialize_gl4es(void);
void set_getprocaddress(void* (*resolver)(const char*));
void set_getmainfbsize(void (*callback)(int*, int*));
void *emscripten_GetProcAddress(const char *name);
}
#include "SYS_System.h"
#include "KX_KetsjiEngine.h"
#include "KX_ISystem.h"
#include "KX_Scene.h"
#include "GEN_Map.h"
#include "SCA_IActuator.h"
#include "RAS_MeshObject.h"
#include "RAS_OpenGLRasterizer.h"
#include "RAS_VAOpenGLRasterizer.h"
#include "RAS_ListRasterizer.h"
#include "RAS_GLExtensionManager.h"
#include "KX_PythonInit.h"
#include "KX_PyConstraintBinding.h"
#include "KX_BlenderSceneConverter.h"
#include "NG_LoopBackNetworkDeviceInterface.h"
#include "SND_DeviceManager.h"
#include "GPC_Canvas.h"
#include "GPC_RenderTools.h"
#include "GPC_MouseDevice.h"
#include "GPG_KeyboardDevice.h"
#include "GHOST_Types.h"

static const int kWidth = 1920, kHeight = 1080;
static EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context;
static void framebuffer_size(int *width, int *height) {
    emscripten_get_canvas_element_size("#canvas", width, height);
}

class BrowserCanvas : public GPC_Canvas {
public:
    BrowserCanvas() : GPC_Canvas(kWidth, kHeight) {}
    void Init() { Resize(kWidth, kHeight); }
    bool BeginDraw() { return emscripten_webgl_make_context_current(context) == EMSCRIPTEN_RESULT_SUCCESS; }
    void EndDraw() {} // Browser presents at the end of the animation callback.
    void SwapBuffers() { glFlush(); }
    void SetMouseState(RAS_MouseState state) {
        EM_ASM({ Module.canvas.style.cursor = $0 == 1 ? 'none' : ($0 == 2 ? 'wait' : 'default'); }, state);
    }
    void SetMousePosition(int, int) {
        fprintf(stderr, "Browser does not permit arbitrary system cursor warping.\n");
    }
};

class BrowserClock : public KX_ISystem {
public:
    double GetTimeInSeconds() { return emscripten_get_now() / 1000.0; }
};

static KX_KetsjiEngine *engine;
static GPG_KeyboardDevice *keyboard;
static GPC_MouseDevice *mouse;
static std::set<int> pressedKeys;

static int browserKey(const EmscriptenKeyboardEvent *event) {
    const char *code = event->code;
    if (!strncmp(code, "Key", 3) && strlen(code) == 4) return code[3];
    if (!strncmp(code, "Digit", 5) && strlen(code) == 6) return code[5];
    struct Key { const char *code; int ghost; };
    static const Key keys[] = {
        {"ArrowLeft", GHOST_kKeyLeftArrow}, {"ArrowRight", GHOST_kKeyRightArrow},
        {"ArrowUp", GHOST_kKeyUpArrow}, {"ArrowDown", GHOST_kKeyDownArrow},
        {"Enter", GHOST_kKeyEnter}, {"Space", GHOST_kKeySpace},
        {"Escape", GHOST_kKeyEsc}, {"Tab", GHOST_kKeyTab},
        {"Backspace", GHOST_kKeyBackSpace}, {"Home", GHOST_kKeyHome},
        {"End", GHOST_kKeyEnd}, {"PageUp", GHOST_kKeyUpPage},
        {"PageDown", GHOST_kKeyDownPage}, {"Insert", GHOST_kKeyInsert},
        {"Delete", GHOST_kKeyDelete}, {"ShiftLeft", GHOST_kKeyLeftShift},
        {"ShiftRight", GHOST_kKeyRightShift}, {"ControlLeft", GHOST_kKeyLeftControl},
        {"ControlRight", GHOST_kKeyRightControl}, {"AltLeft", GHOST_kKeyLeftAlt},
        {"AltRight", GHOST_kKeyRightAlt}, {"CapsLock", GHOST_kKeyCapsLock},
        {"Minus", GHOST_kKeyMinus}, {"Equal", GHOST_kKeyEqual},
        {"BracketLeft", GHOST_kKeyLeftBracket}, {"BracketRight", GHOST_kKeyRightBracket},
        {"Backslash", GHOST_kKeyBackslash}, {"Semicolon", GHOST_kKeySemicolon},
        {"Quote", GHOST_kKeyQuote}, {"Backquote", GHOST_kKeyAccentGrave},
        {"Comma", GHOST_kKeyComma}, {"Period", GHOST_kKeyPeriod},
        {"Slash", GHOST_kKeySlash}, {"NumpadEnter", GHOST_kKeyNumpadEnter},
        {"NumpadAdd", GHOST_kKeyNumpadPlus}, {"NumpadSubtract", GHOST_kKeyNumpadMinus},
        {"NumpadMultiply", GHOST_kKeyNumpadAsterisk}, {"NumpadDivide", GHOST_kKeyNumpadSlash},
        {"NumpadDecimal", GHOST_kKeyNumpadPeriod}
    };
    if (!strncmp(code, "Numpad", 6) && strlen(code) == 7 && code[6] >= '0' && code[6] <= '9')
        return GHOST_kKeyNumpad0 + code[6] - '0';
    if (code[0] == 'F' && atoi(code + 1) >= 1 && atoi(code + 1) <= 24)
        return GHOST_kKeyF1 + atoi(code + 1) - 1;
    for (unsigned i = 0; i < sizeof(keys) / sizeof(keys[0]); ++i)
        if (!strcmp(code, keys[i].code)) return keys[i].ghost;
    return GHOST_kKeyUnknown;
}

static EM_BOOL keyEvent(int type, const EmscriptenKeyboardEvent *event, void *) {
    const int key = browserKey(event);
    if (!event->repeat && key != GHOST_kKeyUnknown) {
        const bool down = type == EMSCRIPTEN_EVENT_KEYDOWN;
        if (down) pressedKeys.insert(key); else pressedKeys.erase(key);
        keyboard->ConvertEvent(key, down);
    }
    return EM_TRUE;
}

static EM_BOOL blurEvent(int, const EmscriptenFocusEvent *, void *) {
    for (std::set<int>::const_iterator key = pressedKeys.begin(); key != pressedKeys.end(); ++key)
        keyboard->ConvertEvent(*key, false);
    pressedKeys.clear();
    mouse->ConvertButtonEvent(GPC_MouseDevice::buttonLeft, false);
    mouse->ConvertButtonEvent(GPC_MouseDevice::buttonMiddle, false);
    mouse->ConvertButtonEvent(GPC_MouseDevice::buttonRight, false);
    return EM_FALSE;
}

static EM_BOOL mouseEvent(int type, const EmscriptenMouseEvent *event, void *) {
    double width, height;
    emscripten_get_element_css_size("#canvas", &width, &height);
    if (width > 0 && height > 0)
        mouse->ConvertMoveEvent(event->targetX * kWidth / width, event->targetY * kHeight / height);
    if (type != EMSCRIPTEN_EVENT_MOUSEMOVE) {
        GPC_MouseDevice::TButtonId button = event->button == 0 ? GPC_MouseDevice::buttonLeft :
            (event->button == 1 ? GPC_MouseDevice::buttonMiddle : GPC_MouseDevice::buttonRight);
        mouse->ConvertButtonEvent(button, type == EMSCRIPTEN_EVENT_MOUSEDOWN);
    }
    return EM_TRUE;
}

static void frame() {
    const int exitCode = engine->GetExitCode();
    if (exitCode) {
        fprintf(stderr, "Engine exit request %d: %s\n", exitCode, (const char *)engine->GetExitString());
        emscripten_cancel_main_loop();
        EM_ASM({ if (Module.onGameExit) Module.onGameExit($0); }, exitCode);
        return;
    }
    if (engine->NextFrame()) engine->Render();
}

int main(int argc, char **argv) {
    if (argc < 2 || argc > 3) { fprintf(stderr, "Usage: player game.blend [diagnostic-scene]\n"); return 1; }
    init_nodesystem();
    initglobals();
    GEN_init_messaging_system();
    EmscriptenWebGLContextAttributes attributes;
    emscripten_webgl_init_context_attributes(&attributes);
    attributes.alpha = false;
    attributes.depth = true;
    attributes.stencil = true;
    attributes.antialias = false;
    attributes.majorVersion = 1;
    emscripten_set_canvas_element_size("#canvas", kWidth, kHeight);
    context = emscripten_webgl_create_context("#canvas", &attributes);
    if (context <= 0 || emscripten_webgl_make_context_current(context) != EMSCRIPTEN_RESULT_SUCCESS) {
        fprintf(stderr, "Unable to create WebGL graphics context.\n"); return 1;
    }
    set_getprocaddress(emscripten_GetProcAddress);
    set_getmainfbsize(framebuffer_size);
    initialize_gl4es();
    GPU_extensions_init();
    bgl::InitExtensions(true);
    printf("GL: %s; renderer: %s\n", glGetString(GL_VERSION), glGetString(GL_RENDERER));

    BlendReadError error;
    BlendFileData *data = BLO_read_from_file(argv[1], &error);
    if (!data) { fprintf(stderr, "Blend loading failed: %s\n", BLO_bre_as_string(error)); return 1; }
    G.main = data->main;
    G.scene = data->curscene;
    if (argc == 3) {
        Scene *selected = (Scene *) data->main->scene.first;
        while (selected && strcmp(selected->id.name + 2, argv[2])) selected = (Scene *) selected->id.next;
        if (!selected) { fprintf(stderr, "Diagnostic scene not found: %s\n", argv[2]); return 1; }
        G.scene = selected;
        printf("Diagnostic direct-scene startup: %s (prior-scene state omitted)\n", argv[2]);
    }
    G.fileflags = data->fileflags;
    BKE_icons_init(1);
    BLI_strncpy(G.sce, data->main->name, sizeof(G.sce));
    setGamePythonPath(G.sce);
    Py_SetPythonHome("/python");

    BrowserCanvas *canvas = new BrowserCanvas();
    canvas->Init();
    GPC_RenderTools *renderTools = new GPC_RenderTools();
    RAS_IRasterizer *rasterizer;
    if (G.fileflags & G_FILE_DISPLAY_LISTS)
        rasterizer = new RAS_ListRasterizer(canvas, GLEW_VERSION_1_1);
    else if (GLEW_VERSION_1_1) rasterizer = new RAS_VAOpenGLRasterizer(canvas);
    else rasterizer = new RAS_OpenGLRasterizer(canvas);
    rasterizer->SetStereoMode(RAS_IRasterizer::RAS_STEREO_NOSTEREO);
    keyboard = new GPG_KeyboardDevice();
    mouse = new GPC_MouseDevice();
    NG_LoopBackNetworkDeviceInterface *network = new NG_LoopBackNetworkDeviceInterface();
    SND_DeviceManager::Subscribe();
    SND_IAudioDevice *audio = SND_DeviceManager::Instance();
    if (!audio) { fprintf(stderr, "Audio device initialization failed.\n"); return 1; }
    engine = new KX_KetsjiEngine(new BrowserClock());
    engine->SetKeyboardDevice(keyboard);
    engine->SetMouseDevice(mouse);
    engine->SetNetworkDevice(network);
    engine->SetCanvas(canvas);
    engine->SetRenderTools(renderTools);
    engine->SetRasterizer(rasterizer);
    engine->SetAudioDevice(audio);
    engine->SetUseFixedTime((G.fileflags & G_FILE_ENABLE_ALL_FRAMES) != 0);
    engine->SetTimingDisplay(false, false, false);
    CValue::SetDeprecationWarnings(true);
    KX_BlenderSceneConverter *converter = new KX_BlenderSceneConverter(data->main, engine);
    engine->SetSceneConverter(converter);
    if (GLEW_ARB_multitexture && GLEW_VERSION_1_1 && (G.fileflags & G_FILE_GAME_MAT))
        converter->SetMaterials(true);
    if (GPU_extensions_minimum_support() && (G.fileflags & G_FILE_GAME_MAT_GLSL))
        converter->SetGLSLMaterials(true);
    KX_Scene *scene = new KX_Scene(keyboard, mouse, network, audio, G.scene->id.name + 2, G.scene);
    PyObject *dictionary = initGamePlayerPythonScripting("Ketsji", psl_Lowest, data->main, argc, argv);
    engine->SetPythonDictionary(dictionary);
    initRasterizer(rasterizer, canvas);
    PyDict_SetItemString(dictionary, "GameLogic", initGameLogic(engine, scene));
    initGameKeys();
    initPythonConstraintBinding();
    initMathutils();
    initGeometry();
    initBGL();
    converter->ConvertScene(scene, dictionary, renderTools, canvas);
    engine->AddScene(scene);
    rasterizer->Init();
    engine->StartEngine(true);
    engine->SetAnimFrameRate((double)G.scene->r.frs_sec / G.scene->r.frs_sec_base);
    emscripten_set_keydown_callback(EMSCRIPTEN_EVENT_TARGET_WINDOW, 0, true, keyEvent);
    emscripten_set_keyup_callback(EMSCRIPTEN_EVENT_TARGET_WINDOW, 0, true, keyEvent);
    emscripten_set_blur_callback(EMSCRIPTEN_EVENT_TARGET_WINDOW, 0, true, blurEvent);
    emscripten_set_mousemove_callback("#canvas", 0, true, mouseEvent);
    emscripten_set_mousedown_callback("#canvas", 0, true, mouseEvent);
    emscripten_set_mouseup_callback("#canvas", 0, true, mouseEvent);
    printf("Original Blender 2.49b engine started scene %s\n", G.scene->id.name + 2);
    EM_ASM({ Module.originalEngineStarted = true; });
    emscripten_set_main_loop(frame, 0, true);
    return 0;
}
