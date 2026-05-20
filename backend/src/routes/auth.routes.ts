import { Router } from "express";
import { login, getAccounts } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.get("/accounts", getAccounts);   // returns available demo accounts for the login page

export default router;
