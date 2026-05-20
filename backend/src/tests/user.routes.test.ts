import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import { AppDataSource } from "../data-source";
import app from "../app";
import { User, UserRole } from "../entities/User";

let testUserId: number;

beforeAll(async () => {
  await AppDataSource.initialize();
  const user = AppDataSource.getRepository(User).create({
    name: `__user_routes_test_${Date.now()}`,
    role: UserRole.REQUESTER,
  });
  const saved = await AppDataSource.getRepository(User).save(user);
  testUserId = saved.id;
});

afterAll(async () => {
  await AppDataSource.getRepository(User).delete({ id: testUserId });
  await AppDataSource.destroy();
});

describe("GET /api/users", () => {
  it("returns an array of users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("does not include password_hash in any user", async () => {
    const res = await request(app).get("/api/users");
    res.body.forEach((u: User) => expect(u).not.toHaveProperty("password_hash"));
  });
});

describe("GET /api/users/:id", () => {
  it("returns a user by id", async () => {
    const res = await request(app).get(`/api/users/${testUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testUserId);
    expect(res.body).not.toHaveProperty("password_hash");
  });

  it("returns 404 when user does not exist", async () => {
    const res = await request(app).get("/api/users/99999");
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });
});
