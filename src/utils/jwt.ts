import jwt from "jsonwebtoken";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN_SECRET!;

interface JwtPayload {
  userId: string;
}

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, ACCESS_TOKEN, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, REFRESH_TOKEN, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, ACCESS_TOKEN) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN);
  } catch (error) {
    return null;
  }
};
