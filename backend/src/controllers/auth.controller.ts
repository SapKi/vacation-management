import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { UserRole } from "../entities/User";

const service = new AuthService();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, password } = req.body;
    const user = await service.login(name, password);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, role, password } = req.body;
    const user = await service.register(name, role as UserRole, password);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};
