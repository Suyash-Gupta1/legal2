import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import connectDB from '@/lib/db';
import { CaseDocument, Case } from '@/models/Schemas';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { Buffer } from 'buffer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    
    // Verify case ownership
    const exists = await Case.findOne({ _id: params.id, userId: session.user.id });
    if (!exists) return NextResponse.json({ message: 'Case not found' }, { status: 404 });

    const contentType = req.headers.get("content-type") || "";
    let docData: any = {};

    if (contentType.includes("multipart/form-data")) {
        // --- Handle File Upload to Cloudinary ---
        const formData = await req.formData();
        const file = formData.get("file") as File;
        
        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary using promise
        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: "legalflow_docs",
                    resource_type: "auto"
                }, 
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        docData = {
            name: file.name,
            type: 'UPLOAD',
            size: (file.size / 1024).toFixed(1) + ' KB',
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id
        };

    } else {
        // --- Handle Invoice Generation (JSON) ---
        const body = await req.json();
        docData = {
            name: body.name,
            type: body.type,
            size: body.size
        };
    }

    // Save to Database
    const doc = await CaseDocument.create({
      caseId: params.id,
      ...docData,
      createdBy: session.user.name || 'User'
    }) as any;

    return NextResponse.json({
      id: doc._id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      url: doc.url,
      createdAt: doc.createdAt,
      createdBy: doc.createdBy
    });

  } catch (error) {
    console.error("Document Upload Error:", error);
    return NextResponse.json({ message: 'Failed to process document' }, { status: 500 });
  }
}