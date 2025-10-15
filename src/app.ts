import dotenv from "dotenv";
dotenv.config();
import express from "express";

const app = express();
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

// ⬇️ Import your DB package (use the exact package.json "name")
import { initModels, sequelize } from "samurai04db";
// Import onStartUp functions
import {
	verifyCheckDirectoryExists,
	onStartUpCreateEnvUsers,
} from "./modules/onStartUp";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
import dataRouter from "./routes/data";

// Verify and create necessary directories first
verifyCheckDirectoryExists();

// Middleware configuration (must be BEFORE routes)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(morgan("dev")); // HTTP request logging

// CORS configuration (must be BEFORE routes)
app.use(
	cors({
		credentials: true,
		exposedHeaders: ["Content-Disposition"], // <-- this line is key
	})
);

// Register routes
app.use("/data", dataRouter);
app.use("/users", usersRouter);
app.use("/", indexRouter);

// Initialize database and startup functions
async function initializeApp() {
	try {
		// Initialize and sync DB
		initModels();
		await sequelize.sync(); // or { alter: true } while iterating
		console.log("✅ Database connected & synced");

		// Run startup functions after database is ready
		await onStartUpCreateEnvUsers();

		console.log("✅ App initialization completed");
	} catch (err) {
		console.error("❌ App initialization failed:", err);
		process.exit(1);
	}
}

// Initialize the app when this module is imported
initializeApp();

// Export the app for server.ts to use
export default app;
