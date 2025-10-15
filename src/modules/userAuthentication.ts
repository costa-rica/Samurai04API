import jwt from "jsonwebtoken";
import { User } from "samurai04db";
// Extend Request interface to include user property
declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

async function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) {
		return res.status(401).json({ message: "Token is required" });
	}

	jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
		if (err) return res.status(403).json({ message: "Invalid token" });
		const { id } = decoded;
		const user = await User.findByPk(id);
		req.user = user;
		next();
	});
}

export { authenticateToken };
