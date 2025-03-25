import { json } from "@sveltejs/kit";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const uploadPassword = process.env.UPLOAD_PASSWORD;

// Ensure the password is set
if (!uploadPassword) {
  throw new Error("UPLOAD_PASSWORD is not set in environment variables");
}

// Hash the password (only if it's defined)
const hashedPassword = bcrypt.hashSync(uploadPassword, 10);

const uploadDir = path.resolve("static/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST({ request }) {
  try {
    const data = await request.formData();
    const file = data.get("file");
    const password = data.get("password");

    if (!password) {
      return json({ error: "Unauthorized: Password required" }, { status: 401 });
    }

    // Verify the password using bcrypt
    const isPasswordCorrect = bcrypt.compareSync(password, hashedPassword);
    if (!isPasswordCorrect) {
      return json({ error: "Unauthorized: Incorrect password" }, { status: 401 });
    }

    if (!file) {
      return json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return json({
      message: "File uploaded successfully",
      fileUrl: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return json({ error: "Upload failed" }, { status: 500 });
  }
}
