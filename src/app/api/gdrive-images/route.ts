// app/api/gdrive-images/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Fetch images from the specified folder
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name, mimeType, thumbnailLink, webContentLink)',
      orderBy: 'createdTime desc',
      pageSize: 100, // Adjust as needed
    });

    const images = response.data.files?.map(file => ({
      id: file.id,
      name: file.name,
      thumbnailLink: file.thumbnailLink,
      webContentLink: file.webContentLink,
      mimeType: file.mimeType,
    })) || [];

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images from Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from Google Drive' },
      { status: 500 }
    );
  }
}