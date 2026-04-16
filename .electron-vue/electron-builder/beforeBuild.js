'use strict'
const fs = require('fs')
const path = require('path')
const os = require('os')

/**
 * beforeBuild hook for electron-builder.
 *
 * Fixes ia32 builds: Electron's node headers (config.gypi) hardcode
 * `v8_enable_pointer_compression: 1` because the headers are published
 * from an x64 build. When compiling native modules for ia32, this causes
 * V8's static_assert ("Pointer compression can be enabled only for 64-bit
 * architectures") to fail. This hook patches config.gypi to set the value
 * to 0 when building for ia32, and cleans native module build caches so
 * node-gyp regenerates project files with the corrected setting.
 *
 * @see https://github.com/electron/rebuild/issues/1140
 *
 * @param {{ appDir: string, electronVersion: string, platform: string, arch: string }} context
 * @returns {Promise<boolean>} - return true to continue the build
 */
const beforeBuild = async (context) => {
  const { electronVersion, platform, arch } = context

  // Only patch for ia32 (32-bit) builds
  if (arch !== 'ia32') {
    return true
  }

  console.log(`[beforeBuild] Patching electron-gyp config for ia32 build (Electron ${electronVersion})`)

  // Locate config.gypi in the electron-gyp cache
  const homeDir = os.homedir()
  const configGypiPath = path.join(
    homeDir,
    '.electron-gyp',
    electronVersion,
    'include',
    'node',
    'config.gypi'
  )

  if (!fs.existsSync(configGypiPath)) {
    console.warn(`[beforeBuild] config.gypi not found at: ${configGypiPath}`)
    console.warn('[beforeBuild] Skipping patch — the file may be created later during rebuild.')
    return true
  }

  try {
    let content = fs.readFileSync(configGypiPath, 'utf8')

    // Check if patching is needed
    if (!content.includes("'v8_enable_pointer_compression': 1")) {
      console.log('[beforeBuild] config.gypi already has correct v8_enable_pointer_compression value, no patch needed.')
      return true
    }

    // Patch: replace v8_enable_pointer_compression from 1 to 0
    content = content.replace(
      /'v8_enable_pointer_compression': 1/g,
      "'v8_enable_pointer_compression': 0"
    )
    fs.writeFileSync(configGypiPath, content, 'utf8')
    console.log('[beforeBuild] Patched config.gypi: v8_enable_pointer_compression 1 -> 0')
  } catch (err) {
    console.error('[beforeBuild] Failed to patch config.gypi:', err.message)
    // Continue build — let it fail naturally if the patch was required
  }

  // Clean native module build directories so node-gyp regenerates vcxproj
  const appDir = context.appDir || process.cwd()
  const nativeModules = ['native-keymap', 'keytar', 'ced', 'fontmanager-redux']
  for (const mod of nativeModules) {
    const buildDir = path.join(appDir, 'node_modules', mod, 'build')
    if (fs.existsSync(buildDir)) {
      try {
        fs.rmSync(buildDir, { recursive: true, force: true })
        console.log(`[beforeBuild] Cleaned build cache for ${mod}`)
      } catch (err) {
        console.warn(`[beforeBuild] Failed to clean build cache for ${mod}:`, err.message)
      }
    }
  }

  return true
}

exports.default = beforeBuild
