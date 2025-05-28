import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./routes";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// setups

app.use(
  cors({
    origin: "http://localhost:3000", // your frontend origin
    credentials: true, // ✅ allow cookies
  })
);

app.use(cookieParser());

app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/api", routes);

export default app;
