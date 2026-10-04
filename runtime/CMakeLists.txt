cmake_minimum_required(VERSION 3.16)
project(blender249_player_archives C CXX)
set(CMAKE_C_STANDARD 90)
set(CMAKE_C_EXTENSIONS ON)
set(CMAKE_CXX_STANDARD 98)
set(CMAKE_CXX_EXTENSIONS ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib")
set(UPSTREAM "${CMAKE_CURRENT_SOURCE_DIR}/.cache/patched/blender-2.49b")
set(PYTHON_INC "${CMAKE_CURRENT_SOURCE_DIR}/.cache/patched/Python-2.6.2/Include" "${CMAKE_CURRENT_SOURCE_DIR}/build/python")
set(WITH_PLAYER ON)
set(WITH_GAMEENGINE ON)
set(WITH_OPENAL ON)
set(WITH_BULLET ON)
set(WITH_DDS ON)
set(WITH_INTERNATIONAL OFF)
set(WITH_ELBEEM OFF)
set(WITH_OPENEXR OFF)
set(WITH_OPENJPEG OFF)
set(WITH_FFMPEG OFF)
set(WITH_QUICKTIME OFF)
set(WITH_VERSE OFF)
set(SDL_INC "${EMSCRIPTEN_SYSROOT}/include/SDL")
set(OPENAL_INC "${EMSCRIPTEN_SYSROOT}/include/AL")
add_compile_options(-funsigned-char -sUSE_LIBPNG=1 -sUSE_LIBJPEG=1 -sUSE_ZLIB=1 -include "${CMAKE_CURRENT_SOURCE_DIR}/build/gl4es-direct.h")
add_compile_definitions(WITH_BULLET GAMEBLENDER GLEW_STATIC)
include_directories(${PYTHON_INC}
  "${CMAKE_CURRENT_SOURCE_DIR}/build/tiff/libtiff"
  "${CMAKE_CURRENT_SOURCE_DIR}/.cache/upstream/tiff-3.9.7/libtiff"
  "${UPSTREAM}/intern/iksolver/extern" "${UPSTREAM}/source/gameengine/BlenderRoutines")
function(BLENDERLIB_NOLIST name sources includes)
  add_library(${name} STATIC ${sources})
  target_include_directories(${name} PRIVATE ${includes})
  set_property(GLOBAL APPEND PROPERTY PLAYER_LIBRARIES ${name})
endfunction()
function(BLENDERLIB name sources includes)
  BLENDERLIB_NOLIST(${name} "${sources}" "${includes}")
endfunction()
foreach(component
  extern/bullet2 extern/solid extern/qhull extern/glew
  intern/guardedalloc intern/string intern/moto intern/memutil intern/bmfont
  intern/iksolver intern/SoundSystem
  source/kernel
  source/blender/blenkernel source/blender/blenlib source/blender/blenloader
  source/blender/blenpluginapi source/blender/imbuf source/blender/imbuf/intern/cineon
  source/blender/imbuf/intern/dds source/blender/avi source/blender/gpu
  source/blender/nodes source/blender/readblenfile source/blender/yafray
  source/gameengine/BlenderRoutines source/gameengine/Converter
  source/gameengine/Expressions source/gameengine/GameLogic source/gameengine/Ketsji
  source/gameengine/Ketsji/KXNetwork source/gameengine/Network
  source/gameengine/Network/LoopBackNetwork source/gameengine/Physics/common
  source/gameengine/Physics/Dummy source/gameengine/Physics/Bullet
  source/gameengine/Physics/Sumo source/gameengine/Rasterizer
  source/gameengine/Rasterizer/RAS_OpenGLRasterizer source/gameengine/SceneGraph
  source/gameengine/VideoTexture source/gameengine/GamePlayer/common)
  add_subdirectory("${UPSTREAM}/${component}" "${component}")
endforeach()
target_compile_definitions(bf_soundsystem PRIVATE DISABLE_SDL)
add_library(bf_dna STATIC "${CMAKE_CURRENT_SOURCE_DIR}/build/dna-wasm32.c")
get_property(PLAYER_LIBRARIES GLOBAL PROPERTY PLAYER_LIBRARIES)
file(GENERATE OUTPUT "${CMAKE_BINARY_DIR}/player-libraries.txt" CONTENT "${PLAYER_LIBRARIES};bf_dna\n")
  add_executable(player
    "${CMAKE_CURRENT_SOURCE_DIR}/player.cpp"
    "${UPSTREAM}/source/gameengine/GamePlayer/ghost/GPG_KeyboardDevice.cpp")
  target_include_directories(player BEFORE PRIVATE "${UPSTREAM}/intern/moto/include")
  foreach(library ${PLAYER_LIBRARIES})
    get_target_property(component_includes ${library} INCLUDE_DIRECTORIES)
    if(component_includes)
      target_include_directories(player PRIVATE ${component_includes})
    endif()
  endforeach()
  target_include_directories(player PRIVATE
    "${UPSTREAM}/source/gameengine/GamePlayer/ghost"
    "${UPSTREAM}/intern/ghost"
    "${UPSTREAM}/intern/ghost/intern")
  target_compile_options(player PRIVATE -g2)
  target_link_libraries(player PRIVATE
    "-Wl,--start-group" ${PLAYER_LIBRARIES} bf_dna
    "${CMAKE_CURRENT_SOURCE_DIR}/build/python/libpython2.6.a"
    "${CMAKE_CURRENT_SOURCE_DIR}/build/glu/libGLU.a"
    "${CMAKE_CURRENT_SOURCE_DIR}/.cache/patched/gl4es/lib/libGL.a"
    "-Wl,--end-group" openal)
  target_link_options(player PRIVATE -g2 -sUSE_LIBPNG=1 -sUSE_LIBJPEG=1 -sUSE_ZLIB=1
    -sFULL_ES2=1 -sGL_ENABLE_GET_PROC_ADDRESS=1 -sEMULATE_FUNCTION_POINTER_CASTS=1
    "-sBINARYEN_EXTRA_PASSES=--pass-arg=max-func-params@32"
    -sSTACK_SIZE=16777216 -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=536870912
    -sMAXIMUM_MEMORY=2147483648 -sFORCE_FILESYSTEM=1
    "-sEXPORTED_RUNTIME_METHODS=['FS','callMain']" "-sEXPORTED_FUNCTIONS=['_main']"
    -sINVOKE_RUN=0
    "--post-js" "${CMAKE_CURRENT_SOURCE_DIR}/browser-support.js"
    "--preload-file" "${CMAKE_CURRENT_SOURCE_DIR}/.cache/patched/Python-2.6.2/Lib@/python/lib/python2.6")
  set_property(TARGET player APPEND PROPERTY LINK_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/browser-support.js")
