import express from "express";
import type { Request, Response } from "express";
import { User, UserData } from "samurai04db";
import { authenticateToken } from "../modules/userAuthentication";
import { createUserDataDirectory } from "../modules/data";
import multer from "multer";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

const router = express.Router();

// Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Generates a unique file path in the given directory by appending _1, _2, etc.
 * if a file with the same name already exists
 */
function uniquePathInDir(dir: string, filename: string): string {
	const { name, ext } = path.parse(filename);
	let candidate = path.join(dir, `${name}${ext}`);
	let i = 1;
	while (fs.existsSync(candidate)) {
		candidate = path.join(dir, `${name}_${i}${ext}`);
		i += 1;
	}
	return candidate;
}

// POST /data/receive-user-data
// Expects multipart/form-data with a single file field named "file"
router.post(
	"/receive-user-data",
	authenticateToken,
	upload.single("file"),
	async (req: Request, res: Response) => {
		try {
			console.log("- in POST /data/receive-user-data");

			// Basic validation
			if (!req.file) {
				return res
					.status(400)
					.json({ ok: false, error: "Missing file. Use field name 'file'." });
			}

			const user = req.user; // populated by authenticateToken; user.id is our PK
			if (!user?.id) {
				return res
					.status(401)
					.json({ ok: false, error: "Unauthenticated or invalid token." });
			}

			// Ensure the destination directory for this user exists
			const { ok, destPath, error } = await createUserDataDirectory(user);
			if (!ok) {
				return res.status(500).json({ ok: false, error: error || destPath });
			}

			// Choose a non-colliding path and write the file from memory to disk
			const originalName = req.file.originalname || "upload";
			const absSavePath = uniquePathInDir(destPath, originalName);

			await fsp.writeFile(absSavePath, req.file.buffer);

			// Persist a record of this upload
			const created = await UserData.create({
				userId: String(user.id),
				pathToFile: absSavePath, // you can store a relative path if you prefer
				filename: path.basename(absSavePath),
			});

			return res.status(201).json({
				ok: true,
				message: "File uploaded and recorded.",
				file: {
					originalName,
					savedAs: path.basename(absSavePath),
					absolutePath: absSavePath,
					size: req.file.size,
					mimeType: req.file.mimetype,
				},
				record: created, // Sequelize instance JSON (id, userId, pathToFile, filename, timestamps)
			});
		} catch (err) {
			console.error(err);
			return res
				.status(500)
				.json({ ok: false, error: "Internal server error." });
		}
	}
);

export default router;
