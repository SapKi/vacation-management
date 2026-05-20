import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import { AppDataSource } from "../data-source";
import app from "../app";
import { User } from "../entities/User";

const TEST_NAME = `__auth_test_${Date.now()}`;
let createdUserId: number;

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  if (createdUserId) {
    await AppDataSource.getRepository(User).delete({ id: createdUserId });
  }
  await AppDataSource.destroy();
});

describe("POST /api/auth/register", () => {
  it("registers a new user and returns data without password_hash", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: TEST_NAME,
      role: "Requester",
      password: "pass1234",
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe(TEST_NAME);
    expect(res.body.role).toBe("Requester");
    expect(res.body).not.toHaveProperty("password_hash");
    createdUserId = res.body.id;
  });

  it("returns 409 when name already exists", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: TEST_NAME,
      role: "Requester",
      password: "pass1234",
    });
    expect(res.status).toBe(409);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      role: "Requester",
      password: "pass1234",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when role is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "NoRole",
      password: "pass1234",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "ShortPw",
      role: "Requester",
      password: "pw",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("returns user data on valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      name: TEST_NAME,
      password: "pass1234",
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(TEST_NAME);
    expect(res.body).not.toHaveProperty("password_hash");
  });

  it("returns 401 on wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      name: TEST_NAME,
      password: "wrongpass",
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 when user does not exist", async () => {
    const res = await request(app).post("/api/auth/login").send({
      name: "ghost_user_xyz",
      password: "pass1234",
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "pass1234",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      name: TEST_NAME,
    });
    expect(res.status).toBe(400);
  });
});
