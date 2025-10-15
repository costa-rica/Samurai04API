import fs from "fs";
import path from "path";

async function createUserDataDirectory(user: any) {
	// check for user folder in PATH_TO_USER_CONTEXT_DATA, if it doesn't exist, create it
	const targetDir = process.env.PATH_TO_USER_CONTEXT_DATA;
	if (!targetDir) {
		return {
			ok: false,
			error: "PATH_TO_USER_CONTEXT_DATA env var is not set.",
		};
	}
	// folder name should have format  `user_000#` where # is the user id with leading zeros
	const destPath = path.join(
		targetDir,
		`user_${user.id.toString().padStart(3, "0")}`
	);
	if (!fs.existsSync(destPath)) {
		fs.mkdirSync(destPath);
	}

	return {
		ok: true,
		destPath,
	};
}

export { createUserDataDirectory };
