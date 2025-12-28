#!/usr/bin/env node

/**
 * Script to optimize padpad.png image
 * Creates WebP and AVIF versions and resized versions
 * 
 * Usage: node scripts/optimize-image.js
 * 
 * Requires: sharp (npm install sharp)
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const inputPath = path.join(__dirname, '../app/public/padpad.png')
const outputDir = path.join(__dirname, '../app/public')

async function optimizeImage() {
  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`)
      process.exit(1)
    }

    console.log('Optimizing padpad.png...')

    // Create different sizes
    const sizes = [
      { width: 256, height: 256, suffix: '-256' },
      { width: 384, height: 384, suffix: '-384' },
      { width: 512, height: 512, suffix: '-512' },
    ]

    // Original optimized versions
    const formats = [
      { ext: 'webp', options: { quality: 85 } },
      { ext: 'avif', options: { quality: 80 } },
    ]

    // Optimize original PNG
    await sharp(inputPath)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(path.join(outputDir, 'padpad-optimized.png'))

    console.log('✓ Created padpad-optimized.png')

    // Create WebP and AVIF versions
    for (const format of formats) {
      await sharp(inputPath)
        .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        [format.ext](format.options)
        .toFile(path.join(outputDir, `padpad.${format.ext}`))
      
      console.log(`✓ Created padpad.${format.ext}`)
    }

    // Create responsive sizes
    for (const size of sizes) {
      // PNG
      await sharp(inputPath)
        .resize(size.width, size.height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png({ quality: 90 })
        .toFile(path.join(outputDir, `padpad${size.suffix}.png`))

      // WebP
      await sharp(inputPath)
        .resize(size.width, size.height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .webp({ quality: 85 })
        .toFile(path.join(outputDir, `padpad${size.suffix}.webp`))

      // AVIF
      await sharp(inputPath)
        .resize(size.width, size.height, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .avif({ quality: 80 })
        .toFile(path.join(outputDir, `padpad${size.suffix}.avif`))

      console.log(`✓ Created padpad${size.suffix}.*`)
    }

    console.log('\n✅ Image optimization complete!')
    console.log('\nNext steps:')
    console.log('1. Update the image src in app/(home)/page.js to use padpad.webp or padpad.avif')
    console.log('2. Consider using responsive images with srcset')
    
  } catch (error) {
    console.error('Error optimizing image:', error)
    process.exit(1)
  }
}

optimizeImage()



