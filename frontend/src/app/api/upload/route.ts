import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';

const BUCKET = process.env.GCS_BUCKET ?? 'lalala-images';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB per file
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function getStorage(): Storage {
  const b64 = process.env.GCS_SA_KEY_B64;
  if (b64) {
    const credentials = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
    return new Storage({ credentials, projectId: credentials.project_id });
  }
  // Fall back to Application Default Credentials (local dev / Cloud Run)
  return new Storage();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const storage = getStorage();
    const bucket = storage.bucket(BUCKET);
    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not allowed. Use JPEG, PNG, WebP or GIF.` },
          { status: 400 },
        );
      }

      if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File exceeds 10 MB limit.` },
          { status: 400 },
        );
      }

      const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
      const objectName = `listings/${randomUUID()}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const gcsFile = bucket.file(objectName);
      await gcsFile.save(buffer, {
        metadata: { contentType: file.type },
        resumable: false,
      });

      urls.push(`https://storage.googleapis.com/${BUCKET}/${objectName}`);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    console.error('[upload] error:', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
