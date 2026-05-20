import { Router } from "express";
import {
  createRequest,
  getRequestsByUser,
  getAllRequests,
  updateRequest,
  cancelRequest,
  approveRequest,
  rejectRequest,
} from "../controllers/vacationRequest.controller";

const router = Router();

router.post("/", createRequest);
router.get("/user/:userId", getRequestsByUser);
router.get("/", getAllRequests);
router.patch("/:id", updateRequest);
router.patch("/:id/cancel",  cancelRequest);
router.patch("/:id/approve", approveRequest);
router.patch("/:id/reject", rejectRequest);

export default router;
