/**
 * Tests for the listing-photo pipeline (no browser needed).
 * Run: npm run test:images
 *
 * Covers the pure helpers in src/lib/image-utils.ts and the decode → canvas → JPEG
 * flow in src/lib/image-compress.ts with a faked DOM (createImageBitmap, <img>,
 * FileReader, canvas), including the HEIC and fallback paths.
 */
import assert from "node:assert/strict";
import test from "node:test";

const utils = await import("@/lib/image-utils");

test("accepts photos by MIME type or by extension when type is missing", () => {
  assert.equal(utils.isAcceptableImageFile({ name: "a.jpg", type: "image/jpeg", size: 1 }), true);
  assert.equal(utils.isAcceptableImageFile({ name: "IMG_0001.HEIC", type: "", size: 1 }), true);
  assert.equal(utils.isAcceptableImageFile({ name: "photo.heif", type: "application/octet-stream", size: 1 }), true);
  assert.equal(utils.isAcceptableImageFile({ name: "x.png", type: "image/png", size: 1 }), true);
  assert.equal(utils.isAcceptableImageFile({ name: "doc.pdf", type: "application/pdf", size: 1 }), false);
  assert.equal(utils.isAcceptableImageFile({ name: "noext", type: "", size: 1 }), false);
});

test("detects HEIC", () => {
  assert.equal(utils.isHeicFile({ name: "a.heic", type: "", size: 1 }), true);
  assert.equal(utils.isHeicFile({ name: "a", type: "image/heif", size: 1 }), true);
  assert.equal(utils.isHeicFile({ name: "a.jpg", type: "image/jpeg", size: 1 }), false);
});

test("fitWithin scales down to 1200px longest edge and never up", () => {
  assert.deepEqual(utils.fitWithin(4032, 3024, 1200), { width: 1200, height: 900 });
  assert.deepEqual(utils.fitWithin(3024, 4032, 1200), { width: 900, height: 1200 });
  assert.deepEqual(utils.fitWithin(800, 600, 1200), { width: 800, height: 600 });
  assert.deepEqual(utils.fitWithin(0, 0, 1200), { width: 1, height: 1 });
});

test("moveItem reorders and clamps", () => {
  assert.deepEqual(utils.moveItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
  assert.deepEqual(utils.moveItem(["a", "b", "c"], 0, 1), ["b", "a", "c"]);
  assert.deepEqual(utils.moveItem(["a", "b", "c"], 1, 99), ["a", "c", "b"]);
  assert.deepEqual(utils.moveItem(["a", "b", "c"], 5, 0), ["a", "b", "c"]);
});

test("addChips splits, trims and de-duplicates case-insensitively", () => {
  assert.deepEqual(utils.addChips(["M"], "s, m ,L,,  xl "), ["M", "s", "L", "xl"]);
  assert.deepEqual(utils.addChips([], "One   size"), ["One size"]);
});

test("dataUrlBytes estimates size", () => {
  assert.equal(utils.dataUrlBytes("data:image/jpeg;base64,QUJD"), 3);
  assert.equal(utils.dataUrlBytes("data:image/jpeg;base64,QUI="), 2);
});

test("isQuotaError recognises browser quota errors", () => {
  assert.equal(utils.isQuotaError({ name: "QuotaExceededError" }), true);
  assert.equal(utils.isQuotaError({ code: 22 }), true);
  assert.equal(utils.isQuotaError(new Error("x")), false);
});

// ───────── Fake DOM for image-compress.ts ─────────

const calls = {};
function installDom({ bitmap = "ok", img = "ok", reader = "ok", width = 4032, height = 3024 } = {}) {
  for (const key of Object.keys(calls)) delete calls[key];
  calls.revoked = 0;
  calls.closed = 0;

  class FakeImage {
    constructor() {
      this.naturalWidth = 0;
      this.naturalHeight = 0;
    }
    set src(value) {
      this._src = value;
      const mode = value.startsWith("blob:") ? img : reader === "ok" && value.startsWith("data:") ? "ok" : "fail";
      queueMicrotask(() => {
        if (mode === "ok") {
          this.naturalWidth = width;
          this.naturalHeight = height;
          calls.imgSrc = value;
          this.onload?.();
        } else {
          this.onerror?.();
        }
      });
    }
  }

  const win = {
    Image: FakeImage,
    createImageBitmap:
      bitmap === "missing"
        ? undefined
        : async (_file, options) => {
            calls.bitmapOptions = options;
            if (bitmap === "fail") throw new Error("unsupported");
            if (bitmap === "no-options" && options) throw new TypeError("options not supported");
            return { width, height, close: () => (calls.closed += 1) };
          },
  };
  globalThis.window = win;
  globalThis.document = {
    createElement: (tag) => {
      assert.equal(tag, "canvas");
      const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({
          fillRect: () => {},
          drawImage: (_src, x, y, w, h) => (calls.drawn = { x, y, w, h }),
          set fillStyle(v) { calls.fill = v; },
          set imageSmoothingQuality(_v) {},
        }),
        toDataURL: (type, quality) => {
          calls.toDataURL = { type, quality, width: canvas.width, height: canvas.height };
          return "data:image/jpeg;base64,/9j/AAAA";
        },
      };
      return canvas;
    },
  };
  globalThis.URL.createObjectURL = () => "blob:fake";
  globalThis.URL.revokeObjectURL = () => (calls.revoked += 1);
  globalThis.FileReader = class {
    readAsDataURL() {
      queueMicrotask(() => {
        if (reader === "ok") {
          this.result = "data:image/jpeg;base64,AAAA";
          this.onload?.();
        } else {
          this.error = new Error("read failed");
          this.onerror?.();
        }
      });
    }
  };
}

const { compressImageToDataUrl } = await import("@/lib/image-compress");
// A Blob that looks like a picked File with a chosen name and size (Blob.size is read-only).
function file(name, type, size = 3_000_000) {
  const blob = new Blob(["x"], { type });
  return new Proxy(blob, {
    get(target, prop) {
      if (prop === "size") return size;
      if (prop === "name") return name;
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
    has(target, prop) {
      return prop === "name" || prop in target;
    },
  });
}

test("large phone JPEG → 1200px JPEG at quality 0.8 via createImageBitmap", async () => {
  installDom();
  const url = await compressImageToDataUrl(file("IMG_1.jpg", "image/jpeg", 9_000_000));
  assert.match(url, /^data:image\/jpeg/);
  assert.equal(calls.toDataURL.type, "image/jpeg");
  assert.equal(calls.toDataURL.quality, 0.8);
  assert.deepEqual(calls.drawn, { x: 0, y: 0, w: 1200, h: 900 });
  assert.deepEqual(calls.bitmapOptions, { imageOrientation: "from-image" });
  assert.equal(calls.closed, 1, "bitmap is released");
  assert.equal(calls.fill, "#ffffff", "transparent areas become white");
});

test("older Safari: createImageBitmap rejects the options bag, retried without it", async () => {
  installDom({ bitmap: "no-options", width: 3000, height: 4000 });
  await compressImageToDataUrl(file("a.png", "image/png"));
  assert.deepEqual(calls.drawn, { x: 0, y: 0, w: 900, h: 1200 });
});

test("no createImageBitmap: falls back to <img> + object URL and revokes it", async () => {
  installDom({ bitmap: "missing", width: 1000, height: 500 });
  await compressImageToDataUrl(file("b.webp", "image/webp"));
  assert.equal(calls.imgSrc, "blob:fake");
  assert.deepEqual(calls.drawn, { x: 0, y: 0, w: 1000, h: 500 });
  assert.equal(calls.revoked, 1);
});

test("object URL fails too: falls back to FileReader data URL", async () => {
  installDom({ bitmap: "fail", img: "fail", width: 2400, height: 2400 });
  await compressImageToDataUrl(file("c.jpg", "image/jpeg", 100_000));
  assert.match(calls.imgSrc, /^data:/);
  assert.deepEqual(calls.drawn, { x: 0, y: 0, w: 1200, h: 1200 });
});

test("HEIC the browser can't decode gives a friendly HEIC message", async () => {
  installDom({ bitmap: "fail", img: "fail", reader: "fail" });
  await assert.rejects(() => compressImageToDataUrl(file("IMG_9.HEIC", "")), /HEIC photo this browser can't open/);
});

test("HEIC with empty MIME type is accepted and decoded when the browser can (iOS Safari)", async () => {
  installDom();
  const url = await compressImageToDataUrl(file("IMG_10.heic", ""));
  assert.match(url, /^data:image\/jpeg/);
});

test("non-images and huge files are refused with clear messages", async () => {
  installDom();
  await assert.rejects(() => compressImageToDataUrl(file("cv.pdf", "application/pdf")), /isn't a photo/);
  await assert.rejects(() => compressImageToDataUrl(file("big.jpg", "image/jpeg", 60 * 1024 * 1024)), /too large/);
});
