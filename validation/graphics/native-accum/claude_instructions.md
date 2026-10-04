# Native accumulation diagnostic

Parent requested preservation of the small native OpenGL accumulation hook and measured results. Original Linux32 Blender2.49b context is the authority for this measurement. Keep original game untouched, no runtime patches, no float accumulation prototype, no binaries. Parent owns sharedmanifest/commits. Hook intentionally drains GLerrors for diagnostic; never use it during baseline fidelity captures.

Files: hook.c intercepts glXSwapBuffers/glAccum through LD_PRELOAD; README.md records exact environment/result and reproduction; concerns.md preserves limits; .claude_todo.md tracks completion.
