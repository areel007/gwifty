import { Request, Response } from "express";
import User from "../../models/user";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();

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

    const user = await User.findOne({ _id: userId });

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
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await User.deleteOne({ _id: userId });

    // await prisma.trade.deleteMany({ where: { sellerId: userId } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};
