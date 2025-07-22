import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user"; // adjust path as needed

interface AuthRequest extends Request {
  user?: any; // you can type this more strictly if you have a User type
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ verify and decode the token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    // ✅ check if payload contains id
    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // ✅ fetch user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // ✅ attach user to request and proceed
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authorize =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user?.role.toLowerCase())) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };
