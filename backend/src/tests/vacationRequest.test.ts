import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import { AppDataSource } from "../data-source";
import app from "../app";
import { User, UserRole } from "../entities/User";
import { VacationRequest } from "../entities/VacationRequest";

let testUserId: number;
let testRequestId: number;

beforeAll(async () => {
  await AppDataSource.initialize();

  // Create a dedicated test user
  const user = AppDataSource.getRepository(User).create({
    name: "Test User",
    role: UserRole.REQUESTER,
  });
  const saved = await AppDataSource.getRepository(User).save(user);
  testUserId = saved.id;
});

afterAll(async () => {
  // Clean up test data
  await AppDataSource.getRepository(VacationRequest).delete({ user_id: testUserId });
  await AppDataSource.getRepository(User).delete({ id: testUserId });
  await AppDataSource.destroy();
});

describe("POST /api/vacation-requests — create request", () => {
  it("creates a vacation request successfully with status Pending", async () => {
    const res = await request(app).post("/api/vacation-requests").send({
      userId: testUserId,
      startDate: "2026-09-01",
      endDate: "2026-09-05",
      reason: "Test vacation",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("Pending");
    expect(res.body.user_id).toBe(testUserId);
    testRequestId = res.body.id;
  });

  it("returns 400 when endDate is before startDate", async () => {
    const res = await request(app).post("/api/vacation-requests").send({
      userId: testUserId,
      startDate: "2026-09-10",
      endDate: "2026-09-01",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/endDate/i);
  });

  it("returns 404 when user does not exist", async () => {
    const res = await request(app).post("/api/vacation-requests").send({
      userId: 99999,
      startDate: "2026-09-01",
      endDate: "2026-09-05",
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/user not found/i);
  });

  it("returns 400 when startDate is missing", async () => {
    const res = await request(app).post("/api/vacation-requests").send({
      userId: testUserId,
      endDate: "2026-09-05",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/startDate/i);
  });
});

describe("PATCH /api/vacation-requests/:id/reject — reject request", () => {
  it("returns 400 when rejecting without a comment", async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/${testRequestId}/reject`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/comments/i);
  });

  it("returns 400 when comment is empty string", async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/${testRequestId}/reject`)
      .send({ comments: "   " });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/comments/i);
  });
});

describe("PATCH /api/vacation-requests/:id/approve — approve request", () => {
  it("approves a request and updates status to Approved", async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/${testRequestId}/approve`)
      .send();
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Approved");
    expect(res.body.id).toBe(testRequestId);
  });

  it("returns 404 when request does not exist", async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/99999/approve`)
      .send();
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});

describe("GET /api/vacation-requests/user/:userId — get by user", () => {
  it("returns only requests belonging to the specified user", async () => {
    const res = await request(app).get(
      `/api/vacation-requests/user/${testUserId}`
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((r: VacationRequest) => {
      expect(r.user_id).toBe(testUserId);
    });
  });
});
