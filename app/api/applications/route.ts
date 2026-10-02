export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || "hexescorts-media";
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://pub-aa01e6dca81f482ab084275e93025a99.r2.dev";
const APPLICATIONS_KEY = "data/applications.json";

const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || "https://b07234f65853d0f9f8e6fa1896cf06db.r2.cloudflarestorage.com";

function getS3Client() {
  if (!accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

async function getApplicationsFromR2() {
  const s3Client = getS3Client();
  if (!s3Client) return [];
  try {
    const res = await s3Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: APPLICATIONS_KEY }));
    const str = await res.Body?.transformToString();
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
}

async function saveApplicationsToR2(apps: any[]) {
  const s3Client = getS3Client();
  if (!s3Client) return;
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