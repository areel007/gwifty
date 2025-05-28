import { Request, Response } from "express";
import prisma from "../../lib/prisma";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
import { comparePassword, hashPassword } from "../../utils/hash_password";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { Role } from "@prisma/client";
import { sendConfirmation } from "../../services/email_service";
import { generateVerificationCode } from "../../utils/verification_code";
import jwt from "jsonwebtoken";

// Temporary store for refresh tokens (use DB in production)
let refreshTokens: string[] = [];

// register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;
    const verificationCode = generateVerificationCode();

    if (!username || username.length < 3) {
      res
        .status(400)
        .json({ error: "Username must be at least 3 characters long" });
      return;
    }

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    // Validate role
    const selectedRole =
      role && Object.values(Role).includes(role) ? role : Role.USER;

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: selectedRole as Role,
        isVerified: false,
        verificationCode,
        verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    // send email verification link
    await sendConfirmation(
      user.email,
      verificationCode,
      process.env.EMAIL_ADDRESS!,
      process.env.EMAIL_PASSWORD!
    );

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// verify user email
export const verififyEmail = async (req: Request, res: Response) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.verificationCode !== verificationCode) {
      res.status(400).json({ error: "Invalid verification code" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "User already verified" });
      return;
    }

    if (user.verificationExpiresAt! < new Date()) {
      res.status(400).json({ error: "Verification code expired" });
      return;
    }
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpiresAt: null,
      },
    });
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    refreshTokens.push(refreshToken);

    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      isVerified: user.isVerified,
    };

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .status(200)
      .json({ ...userWithoutPassword, accessToken }); // ✅ Only return access token
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(401).json({ error: "Refresh token is required" });
    return;
  }

  if (!refreshTokens.includes(token)) {
    res.status(403).json({ error: "Invalid refresh token" });
    return;
  }

  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET!,
    (err: Error | null, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid refresh token" });

      const userId = (user as jwt.JwtPayload).userId;
      const accessToken = generateAccessToken(userId);
      const newRefreshToken = generateRefreshToken(userId);

      // Replace old refresh token
      const index = refreshTokens.indexOf(token);
      if (index !== -1) refreshTokens.splice(index, 1);
      refreshTokens.push(newRefreshToken);

      res
        .cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })
        .status(200)
        .json({ accessToken }); // ✅ Only return access token
    }
  );
};

export const sendConfirmationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "User already verified" });
      return;
    }

    const verificationCode = generateVerificationCode();

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode,
        verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await sendConfirmation(
      user.email,
      verificationCode,
      process.env.EMAIL_ADDRESS!,
      process.env.EMAIL_PASSWORD!
    );

    res.status(200).json({ message: "Confirmation code sent to your email" });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const checkAuth = (req: Request, res: Response) => {
  const user = req.user; // Assuming user is set by the authentication middleware
  res.status(200).json(user);
};

export const logout = (req: Request, res: Response) => {
  res.sendStatus(204);
};
