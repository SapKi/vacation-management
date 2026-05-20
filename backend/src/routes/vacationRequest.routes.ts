import { Router } from "express";
import { VacationRequestService } from "../services/vacationRequest.service";
import { createVacationRequestController } from "../controllers/vacationRequest.controller";

export function createVacationRequestRouter(service: VacationRequestService): Router {
  const router = Router();
  const ctrl = createVacationRequestController(service);
  router.post("/",               ctrl.createRequest);
  router.get("/user/:userId",    ctrl.getRequestsByUser);
  router.get("/",                ctrl.getAllRequests);
  router.patch("/:id",           ctrl.updateRequest);
  router.delete("/:id",          ctrl.deleteRequest);
  router.patch("/:id/approve",   ctrl.approveRequest);
  router.patch("/:id/reject",    ctrl.rejectRequest);
  return router;
}
