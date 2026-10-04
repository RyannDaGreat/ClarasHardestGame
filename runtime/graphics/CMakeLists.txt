cmake_minimum_required(VERSION 3.16)
project(blender_glu_port C CXX)
set(CMAKE_C_STANDARD 99)
set(CMAKE_CXX_STANDARD 98)
get_filename_component(RUNTIME "${CMAKE_CURRENT_SOURCE_DIR}/.." ABSOLUTE)
set(GLU_SOURCE "${RUNTIME}/.cache/upstream/GLU")
# Follow upstream sources. priorityq-heap.c is included textually, not twice.
file(READ "${GLU_SOURCE}/Makefile.am" upstream_makefile)
string(REGEX MATCH "libGLU_la_SOURCES =[^#]+src/libutil/gluint.h" source_section "${upstream_makefile}")
string(REGEX MATCHALL "src/[A-Za-z0-9_./-]+\\.(cc|c)" glu_sources "${source_section}")
list(REMOVE_ITEM glu_sources "src/libtess/priorityq-heap.c")
list(TRANSFORM glu_sources PREPEND "${GLU_SOURCE}/")
add_library(GLU STATIC ${glu_sources})
target_compile_definitions(GLU PRIVATE LIBRARYBUILD)
target_compile_options(GLU PRIVATE -include limits.h)
target_include_directories(GLU PUBLIC
  "${RUNTIME}/build/include" "${RUNTIME}/.cache/patched/gl4es/include"
  PRIVATE "${GLU_SOURCE}/src/include" "${GLU_SOURCE}/src/libnurbs/internals"
  "${GLU_SOURCE}/src/libnurbs/interface" "${GLU_SOURCE}/src/libnurbs/nurbtess")
