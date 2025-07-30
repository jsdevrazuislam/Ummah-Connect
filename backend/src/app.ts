import express, {
  Application,
  urlencoded,
  json,
  Response,
} from "express";
import morgan from "morgan";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import ApiError from "@/utils/ApiError";
import { DATA_LIMIT } from "@/constants";
import cookieParser from "cookie-parser";
import swagger from "@/config/swagger";
import { initializeSocketIO } from "@/socket";
import { connectRedis } from "@/config/redis";
import { load_routes } from "@/utils/load-routes";
import { errorHandler } from "@/middleware/error.middleware";
import '@/cron/scheduler'


const app: Application = express();
const httpServer = createServer(app);
const origin = ["http://localhost:5173", "http://localhost:3000", "https://ummah-connect-client.vercel.app"]

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin,
    credentials: true,
  },
});

app.set("io", io);
connectRedis()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

app.use(
  json({
    limit: DATA_LIMIT,
  })
);
app.use(
  urlencoded({
    extended: true,
    limit: DATA_LIMIT,
  })
);

app.use(limiter);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin,
    credentials: true,
  })
);

const startApp = async () => {

  await load_routes(app);

  swagger(app)
  initializeSocketIO({ io });

  app.get("/", (_, res: Response) => {
    res.status(404).json({
      message: "Oops! The page you are looking for does not exist.",
      documentation: "You can find the API documentation at /api-docs.",
    });
  });

  app.use(errorHandler); 
};

startApp();



export default httpServer