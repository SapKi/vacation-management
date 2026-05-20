import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import { AppDataSource } from "../data-source";
import app from "../app";
import { User, UserRole } from "../entities/User";
import { VacationRequest } from "../entities/VacationRequest";

let testUserId: number;
let pendingId:  number;
let approvedId: number;

beforeAll(async () => {
  await AppDataSource.initialize();

  const user = AppDataSource.getRepository(User).create({
    name: `__routes_test_${Date.now()}`,
    role: UserRole.REQUESTER,
  });
  const saved = await AppDataSource.getRepository(User).save(user);
  testUserId = saved.id;

  // Create a pending request used by update/delete tests
  const r1 = await request(app).post("/api/vacation-requests").send({
    userId: testUserId, startDate: "2026-10-01", endDate: "2026-10-05",
  });
  pendingId = r1.body.id;

  // Create and approve a request used by non-pending guard tests
  const r2 = await request(app).post("/api/vacation-requests").send({
    userId: testUserId, startDate: "2026-11-01", endDate: "2026-11-03",
  });
  approvedId = r2.body.id;
  await request(app).patch(`/api/vacation-requests/${approvedId}/approve`).send();
});

afterAll(async () => {
  await AppDataSource.getRepository(VacationRequest).delete({ user_id: testUserId });
  await AppDataSource.getRepository(User).delete({ id: testUserId });
  await AppDataSource.destroy();
});

describe("GET /api/vacation-requests — get all", () => {
  it("returns an array", async () => {
    const res = await request(app).get("/api/vacation-requests");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("filters by status=Approved", async () => {
    const res = await request(app).get("/api/vacation-requests?status=Approved");
    expect(res.status).toBe(200);
    res.body.forEach((r: VacationRequest) => expect(r.status).toBe("Approved"));
  });

  it("ignores unknown status filter and returns all", async () => {
    const res = await request(app).get("/api/vacation-requests?status=Unknown");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("PATCH /api/vacation-requests/:id — update request", () => {
  it("updates dates on a Pending request", async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/${pendingId}`)
      .send({ startDate: "2026-10-10", endDate: "2026-10-15" });
    expect(res.status).toBe(200);
    expect(res.body.start_date).toBe("2026-10-10");
    expect(res.body.end_date).toBe("2026-10-15");
  });

  it("returns 400 when endDate is before startDate", async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/${pendingId}`)
      .send({ startDate: "2026-10-20", endDate: "2026-10-10" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when trying to edit a non-Pending request", async () => {
    const res = await request(app)
      .patch(`/api/vacation-requests/${approvedId}`)
      .send({ startDate: "2026-11-05", endDate: "2026-11-08" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/pending/i);
  });

  it("returns 404 when request does not exist", async () => {
    const res = await request(app)
      .patch("/api/vacation-requests/99999")
      .send({ startDate: "2026-10-10", endDate: "2026-10-15" });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/vacation-requests/:id/reject — reject with comment", () => {
  it("rejects a Pending request and stores comment", async () => {
    // Create a fresh pending request for reject
    const r = await request(app).post("/api/vacation-requests").send({
      userId: testUserId, startDate: "2026-12-01", endDate: "2026-12-03",
    });
    const id = r.body.id;

    const res = await request(app)
      .patch(`/api/vacation-requests/${id}/reject`)
      .send({ comments: "Team too busy" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Rejected");
    expect(res.body.comments).toBe("Team too busy");
  });
});

describe("DELETE /api/vacation-requests/:id — cancel request", () => {
  it("deletes a Pending request and returns 204", async () => {
    const r = await request(app).post("/api/vacation-requests").send({
      userId: testUserId, startDate: "2027-01-01", endDate: "2027-01-03",
    });
    const res = await request(app).delete(`/api/vacation-requests/${r.body.id}`);
    expect(res.status).toBe(204);
  });

  it("returns 400 when trying to delete a non-Pending request", async () => {
    const res = await request(app).delete(`/api/vacation-requests/${approvedId}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/pending/i);
  });

  it("returns 404 when request does not exist", async () => {
    const res = await request(app).delete("/api/vacation-requests/99999");
    expect(res.status).toBe(404);
  });
});
