import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// Configuration
cloudinary.config({
  cloud_name: "djbpo9xg5",
  api_key: "542555481641548",
  api_secret: "5uf2BR_KdJzKfX_5nKk7_ewWts8",
});

interface cloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: string; // Duration might come as a string
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = (formData.get("file") as File) || null;
    const title = (formData.get("title") as string);
    const description = (formData.get("description") as string);
    const originalSize = (formData.get("originalSize") as string);

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<cloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "video-uploads",
          transformation: [{ quality: "auto", fetch_format: "mp4" }],
          timeout: 60000 // 60 seconds timeout
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as cloudinaryUploadResult);
        }
      );
      uploadStream.end(buffer);
    });

    // Convert duration to a number if it exists
    const duration = result.duration ? parseFloat(result.duration) : 0;

    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        originalSize: originalSize,
        compressedSize: String(result.bytes),
        duration // Make sure this is a number
      }
    });

    return NextResponse.json(video);

  } catch (error) {
    console.log("upload video error: ", error);
    return NextResponse.json({ error: "upload video error " }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
