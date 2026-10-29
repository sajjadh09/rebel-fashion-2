/**
 * Browser-only: turns a photo picked from a phone gallery or computer into a
 * compressed JPEG data URL (max 1200px on the longest edge, quality 0.8).
 *
 * Decoding is tried three ways, because phones differ:
 *   1. createImageBitmap (fast, respects EXIF rotation, works for HEIC on iOS Safari)
 *   2. <img> from an object URL
 *   3. <img> from a FileReader data URL (older Android WebViews)
 * Used by the mock API so listing photos fit in localStorage. A real backend
 * should receive the compressed blob instead (see BACKEND.md, uploadListingImage).
 */
import { fitWithin, isAcceptableImageFile, isHeicFile, JPEG_QUALITY, MAX_IMAGE_EDGE, MAX_SOURCE_BYTES } from "@/lib/image-utils";

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode failed"));
    image.src = src;
  });
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

async function decode(file: Blob): Promise<Decoded> {
  // 1. createImageBitmap
  if (typeof window.createImageBitmap === "function") {
    try {
      let bitmap: ImageBitmap;
      try {
        bitmap = await window.createImageBitmap(file, { imageOrientation: "from-image" });
      } catch {
        bitmap = await window.createImageBitmap(file); // older Safari rejects the options bag
      }
      if (bitmap.width > 0 && bitmap.height > 0) {
        return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
      }
      bitmap.close();
    } catch {
      // fall through
    }
  }

  // 2. <img> + object URL
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    if (image.naturalWidth > 0) {
      return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(objectUrl) };
    }
  } catch {
    // fall through
  }
  URL.revokeObjectURL(objectUrl);

  // 3. <img> + FileReader data URL
  const dataUrl = await readAsDataUrl(file);
  const image = await loadImage(dataUrl);
  return { source: image, width: image.naturalWidth, height: image.naturalHeight, release: () => undefined };
}

/** Draws any decodable image into a JPEG data URL no larger than maxSize on its longest edge. */
export async function compressImageToDataUrl(
  file: File | Blob,
  maxSize = MAX_IMAGE_EDGE,
  quality = JPEG_QUALITY
): Promise<string> {
  const meta = {
    name: "name" in file ? file.name : "photo",
    type: file.type,
    size: file.size,
  };

  if (!isAcceptableImageFile(meta)) {
    throw new Error(`"${meta.name}" isn't a photo. Please choose a JPG, PNG, WEBP or HEIC image.`);
  }
  if (meta.size > MAX_SOURCE_BYTES) {
    throw new Error(`"${meta.name}" is too large (over 40 MB). Please choose a smaller photo.`);
  }

  let decoded: Decoded;
  try {
    decoded = await decode(file);
  } catch {
    throw new Error(
      isHeicFile(meta)
        ? `"${meta.name}" is a HEIC photo this browser can't open. On iPhone, pick it from Photos in Safari (it converts automatically), or set Settings → Camera → Formats → Most Compatible.`
        : `We couldn't open "${meta.name}". Please try a different photo.`
    );
  }

  try {
    const { width, height } = fitWithin(decoded.width, decoded.height, maxSize);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser can't process photos. Please try another browser.");

    context.fillStyle = "#ffffff"; // transparent PNGs get a white background, not black
    context.fillRect(0, 0, width, height);
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded.source, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (!dataUrl.startsWith("data:image/")) {
      throw new Error(`We couldn't process "${meta.name}". Please try a different photo.`);
    }
    // Free the canvas memory quickly on phones.
    canvas.width = 0;
    canvas.height = 0;
    return dataUrl;
  } finally {
    decoded.release();
  }
}

/** Re-compresses an existing data URL smaller (used when browser storage is nearly full). */
export async function shrinkDataUrl(dataUrl: string, maxSize: number, quality: number): Promise<string> {
  if (!dataUrl.startsWith("data:image/")) return dataUrl;
  const blob = await (await fetch(dataUrl)).blob();
  return compressImageToDataUrl(blob, maxSize, quality);
}
