import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * POST /api/upload
 *   multipart/form-data with a `file` field.
 *   Saves to /public/uploads and returns { url, name, size, mime }.
 *
 * For production, swap this for Vercel Blob / S3 — interface stays the same.
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Fichier trop lourd (max 5 Mo)" },
        { status: 400 }
      );
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté (jpg/png/webp/gif)" },
        { status: 400 }
      );
    }

    const ext = file.type.split("/")[1] ?? "bin";
    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, filename);
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(filePath, bytes);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      name: file.name,
      size: file.size,
      mime: file.type,
    });
  } catch (e) {
    console.error("[/api/upload]", e);
    return NextResponse.json({ error: "Erreur d'upload" }, { status: 500 });
  }
}
