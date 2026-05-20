import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { createContainer } from "./container";
import { createAuthRouter } from "./routes/auth.routes";
import { createVacationRequestRouter } from "./routes/vacationRequest.routes";
import { createUserRouter } from "./routes/user.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

const { authService, vacationService, userRepo } = createContainer(AppDataSource);

app.use("/api/auth",              createAuthRouter(authService));
app.use("/api/vacation-requests", createVacationRequestRouter(vacationService));
app.use("/api/users",             createUserRouter(userRepo));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

export default app;
