// app/api/gdrive-image/[id]/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Get file metadata first to get the mime type
    const fileMetadata = await drive.files.get({
      fileId: params.id,
      fields: 'mimeType',
    });

    // Get file content as a stream
    const response = await drive.files.get(
      { fileId: params.id, alt: 'media' },
      { responseType: 'stream' }
    );

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of response.data) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);

    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fileMetadata.data.mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image from Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}