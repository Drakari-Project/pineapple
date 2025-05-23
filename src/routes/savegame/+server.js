import { json } from "@sveltejs/kit";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { xml } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
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
        //Getting sent data
        const data = await request.formData();
        //Extracting sent data
        const file = data.get("file");
        const password = data.get("password");
        const gameName = data.get("gameName");
        const description = data.get("description");
        const dev = data.get("dev");
        const collection = data.get("collection");
        const isStudentGame = data.get("isStudentGame");
        const command = data.get("command");
        const studentGameEngine = data.get("studentGameEngine")
        const exeName = data.get("exeName")

        if (!password) {
            return json({ error: "Unauthorized: Password required" }, { status: 401 });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, hashedPassword);
            if (!isPasswordCorrect) {
            return json({ error: "Unauthorized: Incorrect password" }, { status: 401 });
        }

        if(!isStudentGame) {
            return json({ error: "No student game bool sent" }, { status: 400 });
        }

        if(!gameName) {
            return json({ error: "No name sent" }, { status: 400 });
        }
      
        if(!collection) {
            return json({ error: "No collection sent" }, { status: 400 });
        }

        if (!file) {
            return json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        const gameFilePath = path.join(uploadDir, "game.zip");

        if (buffer.length < 4) {
            return new Response(JSON.stringify({ error: "File too small" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
        }

        //Checking if file recived is a really zip archive
        const firstFourBytes = buffer.slice(0, 4).toString('hex');

        const expectedSignature = "504b0304";

        const isZip = firstFourBytes === expectedSignature;

        if(!isZip) {
            return json({error: "Uploaded file is not a zip archive!"}, {status: 400});
        }    

       const jsonOutput = { gameName: gameName, collection: collection, isStudentGame: isStudentGame, studentGameEngine: studentGameEngine, command: command, exeName: exeName, desc: description, dev: dev};

        // Define file path (adjust the directory as needed)

        const jsonFilePath = path.join(uploadDir, "banana_config.json");

        // Save the XML file to disk

        fs.writeFileSync(jsonFilePath, JSON.stringify(jsonOutput, null, 2), 'utf-8');

        fs.writeFileSync(gameFilePath, buffer);

        return json({
            message: "File uploaded successfully",
            fileUrl: `/uploads/saved.xml`,
          });

    } catch (error) {
        console.error("File upload error:", error);
        return json({ error: "Upload failed" }, { status: 500 });
    }
}