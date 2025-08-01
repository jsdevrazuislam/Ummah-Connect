import type {
  Application,
  Response,
} from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  json,
  urlencoded,
} from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { connectRedis } from "@/config/redis";
import swagger from "@/config/swagger";
import { API_VERSION, DATA_LIMIT } from "@/constants";
import { errorHandler } from "@/middleware/error.middleware";
import authRoutes from "@/routes/auth.routes";
import commentRoutes from "@/routes/comments.routes";
import conversationRoutes from "@/routes/conversation.routes";
import followsRoutes from "@/routes/follows.routes";
import healthRoute from "@/routes/health.routes";
import notificationRoutes from "@/routes/notification.routes";
import postRoutes from "@/routes/posts.routes";
import reportRoutes from "@/routes/report.routes";
import streamRoutes from "@/routes/stream.routes";
import { initializeSocketIO } from "@/socket";
import ApiError from "@/utils/api-error";
import "@/cron/scheduler";

const app: Application = express();
const httpServer = createServer(app);
const origin = ["http://localhost:5173", "http://localhost:3000", "https://ummah-connect-client.vercel.app"];

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin,
    credentials: true,
  },
});

app.set("io", io);
connectRedis();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${options.max
      } requests per ${options.windowMs / 60000} minutes`,
    );
  },
});

app.use(
  json({
    limit: DATA_LIMIT,
  }),
);
app.use(
  urlencoded({
    extended: true,
    limit: DATA_LIMIT,
  }),
);

app.use(limiter);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin,
    credentials: true,
  }),
);

app.use(`${API_VERSION}/health-check`, healthRoute);
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/post`, postRoutes);
app.use(`${API_VERSION}/comment`, commentRoutes);
app.use(`${API_VERSION}/conversation`, conversationRoutes);
app.use(`${API_VERSION}/stream`, streamRoutes);
app.use(`${API_VERSION}/follow`, followsRoutes);
app.use(`${API_VERSION}/notification`, notificationRoutes);
app.use(`${API_VERSION}/report`, reportRoutes);

swagger(app);
initializeSocketIO({ io });

app.get("/", (_, res: Response) => {
  res.status(404).json({
    message: "Oops! The page you are looking for does not exist.",
    documentation: "You can find the API documentation at /api-docs.",
  });
});

app.use(errorHandler);

export default httpServer;
