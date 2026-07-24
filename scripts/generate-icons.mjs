import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'public', 'logo.png');
const ANDROID_RES = path.join(ROOT, 'android', 'app', 'src', 'main', 'res');

// Android mipmap icon sizes
const ANDROID_ICONS = [
  { folder: 'mipmap-mdpi',    size: 48 },
  { folder: 'mipmap-hdpi',    size: 72 },
  { folder: 'mipmap-xhdpi',   size: 96 },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// PWA icons in public
const PWA_ICONS = [
  { file: path.join(ROOT, 'public', 'icon-192.png'), size: 192 },
  { file: path.join(ROOT, 'public', 'icon-512.png'), size: 512 },
];

async function run() {
  console.log('🎨 Generating icons from logo.png...\n');

  // --- Android mipmap icons ---
  for (const { folder, size } of ANDROID_ICONS) {
    const outDir = path.join(ANDROID_RES, folder);
    fs.mkdirSync(outDir, { recursive: true });

    // ic_launcher.png (standard icon)
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(outDir, 'ic_launcher.png'));

    // ic_launcher_round.png (circular icon)
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(outDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (adaptive icon foreground - larger canvas)
    const fgSize = Math.round(size * 1.5);
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .extend({
        top: Math.round((fgSize - size) / 2),
        bottom: Math.round((fgSize - size) / 2),
        left: Math.round((fgSize - size) / 2),
        right: Math.round((fgSize - size) / 2),
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(outDir, 'ic_launcher_foreground.png'));

    console.log(`  ✅ ${folder} (${size}x${size})`);
  }

  // --- PWA icons (public folder) ---
  for (const { file, size } of PWA_ICONS) {
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(file);
    console.log(`  ✅ PWA icon-${size}.png`);
  }

  // --- drawable-v24 foreground (used by adaptive icons) ---
  const drawableV24 = path.join(ANDROID_RES, 'drawable-v24');
  fs.mkdirSync(drawableV24, { recursive: true });
  await sharp(SOURCE)
    .resize(432, 432, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({ top: 108, bottom: 108, left: 108, right: 108, background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(drawableV24, 'ic_launcher_foreground.png'));
  console.log('  ✅ drawable-v24/ic_launcher_foreground.png');

  // Also put a plain drawable background
  const drawablePlain = path.join(ANDROID_RES, 'drawable');
  fs.mkdirSync(drawablePlain, { recursive: true });
  await sharp(SOURCE)
    .resize(432, 432, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({ top: 108, bottom: 108, left: 108, right: 108, background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(drawablePlain, 'ic_launcher_foreground.png'));
  console.log('  ✅ drawable/ic_launcher_foreground.png');

  console.log('\n✨ All icons generated successfully!');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
