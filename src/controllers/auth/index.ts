import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import { comparePassword, hashPassword } from "../../utils/hash_password";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { Role } from "@prisma/client";

import { Role } from "@prisma/client";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

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
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

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

    // Exclude password from user object before sending response
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
    };

    res.status(200).json({ ...userWithoutPassword, accessToken, refreshToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
