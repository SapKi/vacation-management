import { Router } from "express";
import { IUserRepository } from "../repositories/IUserRepository";
import { asyncHandler } from "../utils/asyncHandler";

export function createUserRouter(userRepo: IUserRepository): Router {
  const router = Router();

  router.get("/", asyncHandler(async (_req, res) => {
    res.json(await userRepo.findAll());
  }));

  router.get("/:id", asyncHandler(async (req, res) => {
    const user = await userRepo.findById(parseInt(req.params.id, 10));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(user);
  }));

  return router;
}
