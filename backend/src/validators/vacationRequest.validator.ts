import { RequestStatus } from "../entities/VacationRequest";

export function validateCreateRequest(userId: number, startDate: string, endDate: string): void {
  if (!userId)     throw { status: 400, message: "userId is required" };
  if (!startDate)  throw { status: 400, message: "startDate is required" };
  if (!endDate)    throw { status: 400, message: "endDate is required" };
  validateDateOrder(startDate, endDate);
}

export function validateUpdateRequest(
  status: RequestStatus,
  startDate: string,
  endDate: string,
): void {
  if (status !== RequestStatus.PENDING)
    throw { status: 400, message: "Only Pending requests can be edited" };
  if (!startDate) throw { status: 400, message: "startDate is required" };
  if (!endDate)   throw { status: 400, message: "endDate is required" };
  validateDateOrder(startDate, endDate);
}

export function validateReject(comments: string): void {
  if (!comments?.trim())
    throw { status: 400, message: "comments is required when rejecting a request" };
}

export function validateDeleteRequest(status: RequestStatus): void {
  if (status !== RequestStatus.PENDING)
    throw { status: 400, message: "Only Pending requests can be cancelled" };
}

function validateDateOrder(startDate: string, endDate: string): void {
  if (new Date(endDate) < new Date(startDate))
    throw { status: 400, message: "endDate must be same as or after startDate" };
}
