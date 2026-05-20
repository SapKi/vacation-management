import { Router } from "express";
import { AuthService } from "../services/auth.service";
import { createAuthController } from "../controllers/auth.controller";

export function createAuthRouter(service: AuthService): Router {
  const router = Router();
  const ctrl = createAuthController(service);
  router.post("/login",    ctrl.login);
  router.post("/register", ctrl.register);
  return router;
}
