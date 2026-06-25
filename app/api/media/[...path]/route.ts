import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  if (!params || !params.path || params.path.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const mediaPath = params.path.join('/');
  
  // Check if file exists in our local backup folder
  const localFilePath = path.join(process.cwd(), 'public', 'storage', mediaPath);
  
  if (fs.existsSync(localFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(localFilePath);
      const ext = path.extname(localFilePath).toLowerCase();
      
      const contentTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.svg': 'image/svg+xml',
        '.jfif': 'image/jpeg'
      };

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentTypes[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (err) {
      console.error('Error reading local file:', err);
      // Fallback to supabase if local read fails for some reason
    }
  }

  // Fallback: Fetch from Supabase via wsrv.nl proxy (for images) or direct (for videos)
  const supabaseUrl = `https://dkyikirsvpauhbexbhvu.supabase.co/storage/v1/object/public/${mediaPath}`;
  
  // Only use wsrv.nl for images
  const isImage = /\.(jpg|jpeg|png|webp|jfif|avif)$/i.test(mediaPath);
  const targetUrl = isImage 
    ? `https://wsrv.nl/?url=${encodeURIComponent(supabaseUrl)}&w=800&output=webp&q=80`
    : supabaseUrl;

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) {
      // Fallback to direct fetch if proxy fails
      const fallbackRes = await fetch(supabaseUrl);
      if (!fallbackRes.ok) return new NextResponse('Not found', { status: fallbackRes.status });
      return new NextResponse(fallbackRes.body, {
        headers: {
          'Content-Type': fallbackRes.headers.get('content-type') || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return new NextResponse(res.body, {
      headers: {
        'Content-Type': isImage ? 'image/webp' : (res.headers.get('content-type') || 'application/octet-stream'),
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new NextResponse('Error fetching from upstream', { status: 500 });
  }
}
