import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

const service = new AuthService();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const user = await service.login(name);
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    next(err);
  }
};

export const getAccounts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await service.getAll();
    res.json(users.map(u => ({ id: u.id, name: u.name, role: u.role })));
  } catch (err) {
    next(err);
  }
};
