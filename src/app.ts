import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();

// setups
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/api", routes);

export default app;
