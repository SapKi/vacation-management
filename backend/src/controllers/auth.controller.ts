import { UserRole } from "../entities/User";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

export function createAuthController(service: AuthService) {
  return {
    login: asyncHandler(async (req, res) => {
      const { name, password } = req.body;
      res.json(await service.login(name, password));
    }),

    register: asyncHandler(async (req, res) => {
      const { name, role, password } = req.body;
      res.status(201).json(await service.register(name, role as UserRole, password));
    }),
  };
}
