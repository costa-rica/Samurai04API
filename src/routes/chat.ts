import express from "express";
import type { Request, Response } from "express";
import { getConversationId } from "../modules/chat";
import { authenticateToken } from "../modules/userAuthentication";
import fs from "fs";
import path from "path";
import {
	Conversation,
	ContractUserConversation,
	Message,
	UserData,
} from "samurai04db";
import Papa from "papaparse";

const router = express.Router();

// Interface for the message history sent to Langflow
interface MessageHistoryItem {
	role: string;
	content: string;
	encoding: string;
}

// Interface for user context data
interface UserContextItem {
	description: string;
	data: any[];
}

// Interface for the Langflow request body
interface LangflowRequestBody {
	conversationId: number;
	userMessageHistory: MessageHistoryItem[];
	userContext: UserContextItem[];
	input_type: string;
	output_type: string;
}

// POST /chat/langflow --> sends chat to Langflow
router.post("/langflow", authenticateToken, async (req: Request, res: Response) => {
	try {
		let { conversationId, userMessage } = req.body;

		console.log("- in POST /chat/langflow");
		console.log(JSON.stringify(req.body, null, 2));
		console.log("works good ");

		const user = req.user;
		if (!user?.id) {
			return res
				.status(401)
				.json({ ok: false, error: "Unauthenticated or invalid token." });
		}

		conversationId = await getConversationId(conversationId, user);

		const message = await Message.create({
			conversationId: conversationId,
			content: userMessage,
			role: "user",
		});

		// Create context list user files
		const userContextDataFilesArray = await UserData.findAll({
			where: { userId: user.id },
		});

		// Create a json array object that reads each of the csv files into a different element
		const userContextDataFilesArrayJson: UserContextItem[] =
			userContextDataFilesArray.map((file) => {
				const filePath = path.join(file.pathToFile);
				const fileContent = fs.readFileSync(filePath, "utf8");

				// Parse CSV into JSON
				const parsed = Papa.parse(fileContent, {
					header: true, // use first row as keys
					skipEmptyLines: true,
				});

				return {
					description: file.filename.split(".")[0],
					data: parsed.data, // <-- this is now an array of JSON rows
				};
			});

		// Pull messages in a stable order and as plain objects
		const messagesRaw = await Message.findAll({
			where: { conversationId },
			attributes: ["role", "content"],
			order: [["createdAt", "ASC"]],
			raw: true,
		});

		// Helper: make any content safe for HTTP/JSON transport
		const encodeBase64 = (str: string): string => {
			return Buffer.from(String(str ?? ""), "utf8").toString("base64");
		};

		// Build a transport-safe history
		const userMessageHistoryForLangflow: MessageHistoryItem[] = messagesRaw.map(
			(m: any) => ({
				role: m.role,
				// add a fully safe, lossless channel + a flag your webhook can key on
				content: encodeBase64(m.content),
				encoding: "base64",
			})
		);

		const bodyForLangflow: LangflowRequestBody = {
			conversationId,
			userMessageHistory: userMessageHistoryForLangflow,
			userContext: userContextDataFilesArrayJson,
			input_type: "chat",
			output_type: "chat",
		};

		// Send fetch request to Langflow webhook
		const response = await fetch(`${process.env.URL_LANGFLOW_WEBHOOK}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(bodyForLangflow),
		});

		const data = await response.json();
		console.log(data);

		const userMessageHistoryForResponse = await Message.findAll({
			where: { conversationId },
			attributes: ["role", "content"],
		});

		const endpointResponse = {
			message: "Response received",
			conversationId,
			messageHistoryArray: userMessageHistoryForResponse,
			data,
		};

		return res.json(endpointResponse);
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ ok: false, error: "Internal server error." });
	}
});

export default router;
