import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || "hexescorts-media";
const APPLICATIONS_KEY = "data/applications.json";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || "https://b07234f65853d0f9f8e6fa1896cf06db.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "7dd0399854775e1fb6eacee70f5a1a49",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "2bfa7f87c5ba92ecc1a243b494c10c28d4d61a4f469bce8629fd82247d02341a",
  },
});

async function getApplicationsFromR2() {
  try {
    const res = await s3Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: APPLICATIONS_KEY }));
    const str = await res.Body?.transformToString();
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
}

async function saveApplicationsToR2(apps: any[]) {
  const jsonStr = JSON.stringify(apps, null, 2);
  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: APPLICATIONS_KEY,
      Body: Buffer.from(jsonStr),
      ContentType: "application/json",
    })
  );
}

export async function GET() {
  const apps = await getApplicationsFromR2();
  return NextResponse.json(apps);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apps = await getApplicationsFromR2();

    const newApp = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: body.name || "Anonymous",
      phone: body.phone || "",
      whatsapp: body.whatsapp || body.phone || "",
      location: body.location || "Kampala",
      age: body.age || 20,
      short_bio: body.short_bio || "",
      description: body.description || "",
      services: body.services || [],
      profile_image: body.profile_image || "",
      images: body.images || [],
      videos: body.videos || [],
      plan: body.plan || "monthly",
      status: body.status || "pending_payment",
      created_at: new Date().toISOString(),
    };

    const updated = [newApp, ...apps];
    await saveApplicationsToR2(updated);

    return NextResponse.json({ success: true, application: newApp, id: newApp.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save application" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: "Application ID required" }, { status: 400 });

    const apps = await getApplicationsFromR2();
    const updated = apps.map((app: any) => (app.id === id ? { ...app, ...updates } : app));

    await saveApplicationsToR2(updated);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update application" }, { status: 500 });
  }
}