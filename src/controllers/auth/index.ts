import { Request, Response } from "express";
// import prisma from "../../lib/prisma";
import User from "../../models/user";

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
// import { Role } from "@prisma/client";
import { sendConfirmation } from "../../services/email_service";
import { generateVerificationCode } from "../../utils/verification_code";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Temporary store for refresh tokens (use DB in production)
let refreshTokens: string[] = [];

// register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    // const verificationCode = generateVerificationCode();

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

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    // const existingUser = await prisma.user.findFirst({
    //   where: {
    //     OR: [{ email }, { username }],
    //   },
    // });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashedPassword: string = await hashPassword(password);

    // Validate role
    // const selectedRole =
    //   role && Object.values(Role).includes(role) ? role : Role.USER;

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "USER",
      isVerified: false,
    });

    const { password: _, ...userWithoutPassword } = user;

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

    const user = await User.findOne({ email });

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

    await User.findOneAndUpdate(
      { email },
      { isVerified: true, verificationCode: null, verificationExpiresAt: null }
    );

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

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "20m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1h" }
    );

    // TODO: Save refreshToken in a persistent store, not just in memory
    refreshTokens.push(refreshToken);

    const userWithoutPassword = {
      id: user._id,
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
        sameSite: "none", // if frontend/backend are on different origins
      })
      .status(200)
      .json({ ...userWithoutPassword, accessToken });
  } catch (error) {
    console.error("Login error:", error);
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
      const accessToken = generateAccessToken(userId.toString());
      const newRefreshToken = generateRefreshToken(userId.toString());

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
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "User already verified" });
      return;
    }

    const verificationCode = generateVerificationCode();

    await User.findOneAndUpdate(
      { email },
      {
        verificationCode,
        verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    );

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
  try {
    const user = req.user; // Assuming user is set by the authentication middleware
    res.status(200).json(user);
  } catch (error) {
    console.error("Error checking authentication:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.sendStatus(204);
};

export const sendCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const verificationCode = generateVerificationCode();

    const user = await User.findOne({ email });

    await User.findOneAndUpdate(
      { email },
      {
        verificationCode,
        verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    );

    sendConfirmation(
      email,
      verificationCode,
      process.env.EMAIL_ADDRESS!,
      process.env.EMAIL_PASSWORD!
    );

    res
      .status(200)
      .json({ message: "code successfully send.", code: verificationCode });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendResetPasswordEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // expires in 1 hour

    await User.findOneAndUpdate(
      { email },
      {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: expiresAt,
      }
    );

    // TODO: Send `resetToken` to user via email. Example link:
    // `https://yourfrontend.com/reset-password?token=${resetToken}`

    const resetLink = `${process.env.CLIENT_URI}/reset-password?token=${resetToken}`;

    sendConfirmation(
      email,
      resetLink,
      process.env.EMAIL_ADDRESS!,
      process.env.EMAIL_PASSWORD!
    );

    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpiresAt: { $gt: new Date() }, // not expired
  });

  if (!user) {
    res.status(400).json({ message: "Invalid or expired token" });
    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  await User.findOneAndUpdate(
    { _id: user._id },
    {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    }
  );

  res.json({ message: "Password has been reset successfully." });
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const userId = req.user?.id; // Assuming user ID is set in the request

    console.log(userId, oldPassword, newPassword);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isPasswordValid = await comparePassword(oldPassword, user.password);

    if (!isPasswordValid) {
      res.status(400).json({ error: "Old password is incorrect" });
      return;
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await User.findOneAndUpdate(
      { _id: userId },
      {
        password: hashedNewPassword,
      }
    );

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
