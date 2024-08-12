import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient()

// Configuration
cloudinary.config({
  cloud_name: "djbpo9xg5",
  api_key: "542555481641548",
  api_secret: "5uf2BR_KdJzKfX_5nKk7_ewWts8",
});

interface cloudinaryUploadResult {
  public_id: string;
  bytes:number;
  duration?:number;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  // check user loged in or not

  
  try {
      const { userId } = auth();
    
      if (!userId) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }

    const formData = await request.formData();
    const file = (formData.get("file") as File) || null;
    const title = (formData.get("title") as String);
    const description = (formData.get("description") as String);
    const originalSize = (formData.get("originalSize") as String);
    if(!file){
        return NextResponse.json({error:"File not found"},{status:400})
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<cloudinaryUploadResult>(
        (resolve,reject) =>{
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type:"video",
                    folder:"video-uploads",
                    transformation:[
                        {quality:"auto" , fetch_format:"mp4"}
                    ]
                },
                (error,result)=>{
                    if(error) reject(result);
                    else resolve(result as cloudinaryUploadResult)

                }
            )
            uploadStream.end(buffer)
        }
    )

    return NextResponse.json({publicId: result.public_id},{status:200})
    
  } catch (error) {
    console.log("upload image error: ",error)
    return NextResponse.json({error:"upload image error"},{status:500})
  }
}
