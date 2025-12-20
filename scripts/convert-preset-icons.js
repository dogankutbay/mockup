/**
 * Convert preset icon JPG files to WebP format
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const JPG_DIR = join(process.cwd(), 'src', 'assets', 'presetIcons', 'jpg');
const WEBP_DIR = join(process.cwd(), 'src', 'assets', 'presetIcons', 'webp');

async function convertIcons() {
  try {
    // Ensure webp directory exists
    if (!existsSync(WEBP_DIR)) {
      await mkdir(WEBP_DIR, { recursive: true });
      console.log('Created webp directory');
    }

    // Read all JPG files
    const files = await readdir(JPG_DIR);
    const jpgFiles = files.filter(file => file.endsWith('.jpg'));

    console.log(`Found ${jpgFiles.length} JPG files to convert...`);

    // Convert each file
    for (const file of jpgFiles) {
      const inputPath = join(JPG_DIR, file);
      const outputPath = join(WEBP_DIR, file.replace('.jpg', '.webp'));

      await sharp(inputPath)
        .webp({ quality: 90 })
        .toFile(outputPath);

      console.log(`✓ Converted ${file} -> ${file.replace('.jpg', '.webp')}`);
    }

    console.log(`\n✅ Successfully converted ${jpgFiles.length} files to WebP!`);
  } catch (error) {
    console.error('Error converting icons:', error);
    process.exit(1);
  }
}

convertIcons();

