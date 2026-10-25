
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AuthError,
  requireApprovedDoctor,
} from "@/lib/server-auth";



const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    const doctor = await requireApprovedDoctor();

    const apiKey = process.env.IMGBB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Image upload is not configured." },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please select an image." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "The image must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const base64Image = bytes.toString("base64");

    const uploadData = new FormData();
    uploadData.append("image", base64Image);
    uploadData.append("name", `doctor-${doctor.id}`);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body: uploadData,
        cache: "no-store",
      },
    );

    const result = await response.json();

    if (!response.ok || !result.success || !result.data?.url) {
      return NextResponse.json(
        { error: "Image upload failed. Please try again." },
        { status: 502 },
      );
    }

    const imageUrl: string = result.data.url;

    await prisma.user.update({
      where: { id: doctor.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      message: "Profile photo updated successfully.",
      image: imageUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Doctor profile image upload failed.");

    return NextResponse.json(
      { error: "Something went wrong while uploading the image." },
      { status: 500 },
    );
  }
}
