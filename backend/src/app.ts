import express, {
  Application,
  urlencoded,
  json,
  Request,
  Response,
  NextFunction,
} from "express";
import morgan from "morgan";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import ApiError from "@/utils/ApiError";
import { API_VERSION, DATA_LIMIT } from "@/constants";
import cookieParser from "cookie-parser";
import swagger from "@/config/swagger";
import healthRoute from '@/routes/health-routes'
import authRoutes from '@/routes/users-routes'


const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  },
});

app.set("io", io);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
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
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);


app.use(`${API_VERSION}/health-check`, healthRoute);
app.use(`${API_VERSION}/auth`, authRoutes);


swagger(app)

app.get("/", (_, res: Response) => {
  res.status(404).json({
    message: "Oops! The page you are looking for does not exist.",
    documentation: "You can find the API documentation at /api-docs.",
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log("err", err)
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(err.toJSON());
  } else {
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      success: false,
      errors: [],
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});


export default httpServer