import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || "hexescorts-media";
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://pub-aa01e6dca81f482ab084275e93025a99.r2.dev";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || "https://b07234f65853d0f9f8e6fa1896cf06db.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "7dd0399854775e1fb6eacee70f5a1a49",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "2bfa7f87c5ba92ecc1a243b494c10c28d4d61a4f469bce8629fd82247d02341a",
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "profile-images";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: file.type || "image/jpeg",
      })
    );

    const fileUrl = `${R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({ url: fileUrl, success: true });
  } catch (error: any) {
    console.error("Cloudflare R2 Upload Error:", error);
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
  }
}