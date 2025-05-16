import { json } from "@sveltejs/kit";
import fs from "fs";
import path from "path";

// Set the directory you want to read
const DIRECTORY_PATH = "/home/drakari/roms";

export async function GET() {
  try {
    // Read the directory contents
    const files = fs.readdirSync(DIRECTORY_PATH);

    return json({ files });
  } catch (error) {
    console.error("Error reading directory:", error);
    return json({ error: "Failed to read directory" }, { status: 500 });
  }
}
