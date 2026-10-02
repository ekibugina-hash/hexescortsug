import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || "hexescorts-media";
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://pub-aa01e6dca81f482ab084275e93025a99.r2.dev";

const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || "https://b07234f65853d0f9f8e6fa1896cf06db.r2.cloudflarestorage.com";

export async function POST(req: Request) {
  try {
    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json({ error: "Missing Cloudflare R2 environment variables" }, { status: 500 });
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

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