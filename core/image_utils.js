// core/image_utils.js
// Client-side image processing for the family "stories album" feature:
// resizes an uploaded photo and re-exports it via <canvas>. The canvas
// export is what strips ALL metadata (EXIF GPS included) — there is no
// separate "strip" step, it's a side effect of the redraw.
//
// No manual EXIF-orientation handling here on purpose: current browsers
// decode <img>/canvas sources with `image-orientation: from-image` applied
// by default, i.e. `img.naturalWidth`/`naturalHeight` and the pixels drawn
// via drawImage() are ALREADY rotated to match the photo's EXIF tag. Adding
// a second manual rotation on top (as an early version of this file did)
// double-rotates the image and undoes the browser's correction — verified
// against a real JPEG with an injected Orientation=6 tag while building
// this feature, which is why there's no orientation-transform code below.
//
// Plain vanilla script (no JSX) — loaded without type="text/babel".

(function () {
  // Scales (w, h) down so its long edge is at most maxEdge. Never upscales.
  function scaledDims(w, h, maxEdge) {
    const longEdge = Math.max(w, h);
    if (longEdge <= maxEdge) return { width: w, height: h };
    const scale = maxEdge / longEdge;
    return { width: Math.round(w * scale), height: Math.round(h * scale) };
  }

  function canvasToBlob(canvas, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(Object.assign(new Error('Canvas export failed'), { code: 'EXPORT_FAILED' }));
      }, 'image/jpeg', quality);
    });
  }

  // Main entry point. Returns { fullBlob, thumbBlob, width, height }
  // (width/height are the FULL image's final, post-resize pixel dimensions).
  // Rejects with an Error whose `.code === 'DECODE_FAILED'` when the browser
  // can't decode the file at all — the expected case for HEIC on non-Safari
  // browsers. Callers should treat that as a recoverable per-file error.
  async function processStoryImage(file, opts) {
    const {
      maxFullEdge = 1600,
      maxThumbEdge = 400,
      fullQuality = 0.85,
      thumbQuality = 0.7,
    } = opts || {};

    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(Object.assign(new Error('Could not decode image'), { code: 'DECODE_FAILED' }));
        image.src = objectUrl;
      });

      const { width: targetW, height: targetH } = scaledDims(img.naturalWidth, img.naturalHeight, maxFullEdge);

      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = targetW;
      fullCanvas.height = targetH;
      fullCanvas.getContext('2d').drawImage(img, 0, 0, targetW, targetH);

      // Thumbnail is derived from the full canvas — cheaper than re-decoding the source.
      const thumbDims = scaledDims(targetW, targetH, maxThumbEdge);
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = thumbDims.width;
      thumbCanvas.height = thumbDims.height;
      thumbCanvas.getContext('2d').drawImage(fullCanvas, 0, 0, thumbDims.width, thumbDims.height);

      const [fullBlob, thumbBlob] = await Promise.all([
        canvasToBlob(fullCanvas, fullQuality),
        canvasToBlob(thumbCanvas, thumbQuality),
      ]);

      return { fullBlob, thumbBlob, width: targetW, height: targetH };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  window.ImageUtils = {
    processStoryImage,
  };
})();
