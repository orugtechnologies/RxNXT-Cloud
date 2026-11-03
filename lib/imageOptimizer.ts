import { PNG } from 'pngjs';

/**
 * Optimizes and downsizes oversized base64 PNG images on the server.
 * Ensures logos and signatures never bloat database storage or PDF payloads.
 */
export function optimizeBase64Png(dataUri?: string | null, maxDimension = 400): string | null | undefined {
  if (!dataUri) return dataUri;

  // Only attempt server optimization if payload is unusually large (> 200 KB)
  if (dataUri.length < 250000) {
    return dataUri;
  }

  if (!dataUri.startsWith('data:image/png;base64,')) {
    return dataUri;
  }

  try {
    const rawBase64 = dataUri.replace(/^data:image\/png;base64,/, '').trim();
    const buffer = Buffer.from(rawBase64, 'base64');
    const srcPng = PNG.sync.read(buffer);

    if (srcPng.width <= maxDimension && srcPng.height <= maxDimension) {
      return dataUri;
    }

    let targetWidth = srcPng.width;
    let targetHeight = srcPng.height;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
        targetHeight = maxDimension;
      }
    }

    const dstPng = new PNG({ width: targetWidth, height: targetHeight });
    const xRatio = srcPng.width / targetWidth;
    const yRatio = srcPng.height / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = Math.floor(x * xRatio);
        const srcY = Math.floor(y * yRatio);

        const srcIdx = (srcPng.width * srcY + srcX) << 2;
        const dstIdx = (targetWidth * y + x) << 2;

        dstPng.data[dstIdx] = srcPng.data[srcIdx];         // R
        dstPng.data[dstIdx + 1] = srcPng.data[srcIdx + 1]; // G
        dstPng.data[dstIdx + 2] = srcPng.data[srcIdx + 2]; // B
        dstPng.data[dstIdx + 3] = srcPng.data[srcIdx + 3]; // A
      }
    }

    const compressedBuffer = PNG.sync.write(dstPng);
    return `data:image/png;base64,${compressedBuffer.toString('base64')}`;
  } catch (err) {
    console.warn('[ImageOptimizer] Server optimization skipped, keeping original:', err);
    return dataUri;
  }
}
