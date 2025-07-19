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

const corsOptions = {
  origin: "https://gwifty.vercel.app", // ✅ specific origin instead of "*"
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // ✅ still allow credentials
  optionsSuccessStatus: 204,
  allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/api", routes);

export default app;
