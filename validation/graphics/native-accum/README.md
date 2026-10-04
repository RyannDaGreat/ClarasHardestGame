# Native accumulation-buffer measurement

The original Linux32 Blender 2.49b player selected **zero accumulation bits** under Mesa llvmpipe/Xvfb. Adding emulated motion blur by default would change this native behavior. No accumulation adapter is enabled in the browser runtime.

The first `glXSwapBuffers` hook queried `GL_ACCUM_RED_BITS`, `GL_ACCUM_GREEN_BITS`, `GL_ACCUM_BLUE_BITS`, and `GL_ACCUM_ALPHA_BITS`, then issued diagnostic `glAccum(GL_LOAD, 1)`:

```text
NATIVE_ACCUM_FIRST_SWAP diagnostic LOAD follows; subsequentcalls originate game
NATIVE_ACCUM call=1 op=257 value=1 bits=0,0,0,0 prior_error=0 query_error=0 call_error=1282
```

1282 is `GL_INVALID_OPERATION`; LOAD does not alter the drawing buffer. The 45-second run showed the original Lv10 game on screen. No game-originated accumulation calls were observed during that run. Actuator existence alone does not establish activation. The initial 12-second trial ended before the first rendered frame and was inconclusive.

This corrects an earlier research claim: finding empty `glAccum` stubs in GL4ES does **not** establish a missing native visual effect. Original `GHOST_WindowWin32.cpp` also requests zero accumulation bits, but the actual pixel format chosen by the historical Windows driver was not measured.

## Reproduce

Use Linux with the original 32-bit `blender-2.49b-linux-glibc236-py26-i386/blenderplayer`, its existing 32-bit dependencies, and an X display with compatibility OpenGL. The measurement used Ubuntu Jammy in container `rhg-baseline`, Xvfb `:99`, 1920×1080×24, and `LIBGL_ALWAYS_SOFTWARE=1` (Mesa llvmpipe). Installing the diagnostic compiler is reproducible:

```sh
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y gcc-multilib libc6-dev-i386
```

From a Linux checkout root, compile the hook into ignored build output:

```sh
mkdir -p runtime/build/native-accum
cc -m32 -shared -fPIC -Wall -Wextra \
  -o runtime/build/native-accum/hook.so \
  validation/graphics/native-accum/hook.c -ldl
```

Set `BLENDER_PLAYER` to the original executable and `BLEND_INPUT` to the original `.blend` or an existing pointer-only scene fixture. Do not resave the game. Run this in the same Linux environment, allow the first game frame to appear, then press Escape:

```sh
DISPLAY=:99 LIBGL_ALWAYS_SOFTWARE=1 \
LD_PRELOAD="$PWD/runtime/build/native-accum/hook.so" \
  "$BLENDER_PLAYER" -w 1920 1080 0 0 -g noaudio "$BLEND_INPUT"
```

The constructor prints `NATIVE_ACCUM_HOOK_LOADED`; the first swap reports the diagnostic. Subsequent output, up to eight calls total, comes from game accumulation calls. The hook resolves and forwards original GL functions, failing loudly if resolution fails. It intentionally reads and drains GL errors to distinguish preexisting errors from the diagnostic result. This instrumentation is for inspection, not fidelity screenshots or performance benchmarks.
