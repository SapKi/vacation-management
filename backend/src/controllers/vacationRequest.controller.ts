import { Request, Response, NextFunction } from "express";
import { VacationRequestService } from "../services/vacationRequest.service";

const service = new VacationRequestService();

export const createRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await service.createRequest(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getRequestsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const result = await service.getRequestsByUser(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.query;
    const result = await service.getAllRequests(status as string | undefined);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await service.updateRequest(id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const approveRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await service.approveRequest(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const rejectRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { comments } = req.body;
    const result = await service.rejectRequest(id, comments);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
