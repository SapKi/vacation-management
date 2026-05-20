import "reflect-metadata";
import { errorHandler } from "../middleware/errorHandler";
import { Request, Response } from "express";

function makeRes() {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  return res;
}

const req  = {} as Request;
const next = jest.fn();

describe("errorHandler middleware", () => {
  it("uses err.status and err.message when both are present", () => {
    const res = makeRes();
    errorHandler({ status: 404, message: "Not found" }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Not found" });
  });

  it("defaults status to 500 when err.status is missing", () => {
    const res = makeRes();
    errorHandler({ message: "Oops" }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Oops" });
  });

  it("defaults message to 'Internal Server Error' when err.message is missing", () => {
    const res = makeRes();
    errorHandler({ status: 503 } as any, req, res, next);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });

  it("defaults both when error object is empty", () => {
    const res = makeRes();
    errorHandler({} as any, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });
});
