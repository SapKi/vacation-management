import "reflect-metadata";
import express from "express";
import cors from "cors";
import vacationRequestRoutes from "./routes/vacationRequest.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/vacation-requests", vacationRequestRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

export default app;
