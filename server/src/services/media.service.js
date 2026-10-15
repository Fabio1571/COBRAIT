const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const { HttpError } = require("../utils/errors");

const MAX_MEDIA_SIZE = 5 * 1024 * 1024;
const MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

function ensureMediaStorage() {
  fs.mkdirSync(config.mediaUploadPath, { recursive: true });
  fs.mkdirSync(path.dirname(config.mediaIndexPath), { recursive: true });
  if (!fs.existsSync(config.mediaIndexPath)) {
    fs.writeFileSync(config.mediaIndexPath, "[]\n", "utf8");
  }
}

function readMediaIndex() {
  ensureMediaStorage();
  try {
    const parsed = JSON.parse(fs.readFileSync(config.mediaIndexPath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMediaIndex(items) {
  ensureMediaStorage();
  const temporaryPath = config.mediaIndexPath + ".tmp";
  fs.writeFileSync(temporaryPath, JSON.stringify(items, null, 2) + "\n", "utf8");
  fs.renameSync(temporaryPath, config.mediaIndexPath);
}

function normalizeAlt(value) {
  return String(value || "").trim().slice(0, 240);
}

function normalizeOriginalName(value) {
  return path.basename(String(value || "imagem")).replace(/[^a-zA-Z0-9._ -]+/g, "").slice(0, 120) || "imagem";
}

function hasValidSignature(buffer, mimeType) {
  if (mimeType === "image/jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png") return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === "image/webp") return buffer.length > 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

function listMedia() {
  return readMediaIndex().sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")));
}

function saveMedia(buffer, metadata, createdBy) {
  const binary = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
  const mimeType = String(metadata && metadata.mimeType || "").toLowerCase();
  if (!MIME_EXTENSIONS[mimeType]) throw new HttpError(415, "Formato nao suportado. Usa JPG, PNG ou WebP.");
  if (!binary.length) throw new HttpError(400, "O ficheiro está vazio.");
  if (binary.length > MAX_MEDIA_SIZE) throw new HttpError(413, "A imagem excede o limite de 5 MB.");
  if (!hasValidSignature(binary, mimeType)) throw new HttpError(400, "O conteúdo do ficheiro não corresponde ao formato indicado.");

  ensureMediaStorage();
  const id = crypto.randomUUID();
  const extension = MIME_EXTENSIONS[mimeType];
  const storedName = `${Date.now()}-${id.slice(0, 8)}.${extension}`;
  fs.writeFileSync(path.join(config.mediaUploadPath, storedName), binary);

  const item = {
    id,
    originalName: normalizeOriginalName(metadata && metadata.originalName),
    storedName,
    mimeType,
    size: binary.length,
    alt: normalizeAlt(metadata && metadata.alt),
    url: `/assets/uploads/${storedName}`,
    createdBy: createdBy || null,
    createdAt: new Date().toISOString()
  };
  const items = readMediaIndex();
  items.push(item);
  writeMediaIndex(items);
  return item;
}

module.exports = {
  listMedia,
  saveMedia
};
