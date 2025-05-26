import { Request, Response } from "express";
import prisma from "../../lib/prisma";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(
      users.map((user) => {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          role: user.role,
        };
      })
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
