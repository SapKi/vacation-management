import { VacationRequestService } from "../services/vacationRequest.service";
import { asyncHandler } from "../utils/asyncHandler";

export function createVacationRequestController(service: VacationRequestService) {
  return {
    createRequest: asyncHandler(async (req, res) => {
      res.status(201).json(await service.createRequest(req.body));
    }),

    getRequestsByUser: asyncHandler(async (req, res) => {
      res.json(await service.getRequestsByUser(parseInt(req.params.userId, 10)));
    }),

    getAllRequests: asyncHandler(async (req, res) => {
      res.json(await service.getAllRequests(req.query.status as string | undefined));
    }),

    updateRequest: asyncHandler(async (req, res) => {
      res.json(await service.updateRequest(parseInt(req.params.id, 10), req.body));
    }),

    approveRequest: asyncHandler(async (req, res) => {
      res.json(await service.approveRequest(parseInt(req.params.id, 10)));
    }),

    rejectRequest: asyncHandler(async (req, res) => {
      res.json(await service.rejectRequest(parseInt(req.params.id, 10), req.body.comments));
    }),

    deleteRequest: asyncHandler(async (req, res) => {
      await service.deleteRequest(parseInt(req.params.id, 10));
      res.status(204).send();
    }),
  };
}
