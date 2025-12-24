import { verifyToken } from "@clerk/backend";


export async function requireAuth(req, res, next) {
  console.log("Authenticated user:", req.userId);
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const token = authHeader.replace("Bearer ", "");

    const { sub } = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Clerk user ID
    req.userId = sub;

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
