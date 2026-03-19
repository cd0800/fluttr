// Integration tests for API endpoints using a temporary database.
const fs = require("fs");
const path = require("path");
const request = require("supertest");

const TEST_DB = path.join(__dirname, "butterflies.test.db");

beforeAll(() => {
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
  }
  process.env.FLUTTR_DB_PATH = TEST_DB;
});

afterAll(async () => {
  const app = require("../server");
  if (app.locals.db) {
    await new Promise((resolve) => app.locals.db.close(resolve));
  }
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
  }
});

test("sign up creates an account and returns a user", async () => {
  const app = require("../server");
  const response = await request(app)
    .post("/api/signup")
    .send({ name: "Ada Lovelace", email: "ada@example.com", password: "pass123" });

  expect(response.status).toBe(201);
  expect(response.body.user.email).toBe("ada@example.com");
});

test("sign up rejects duplicate emails", async () => {
  const app = require("../server");
  await request(app)
    .post("/api/signup")
    .send({ name: "Ada Lovelace", email: "dup@example.com", password: "pass123" });

  const response = await request(app)
    .post("/api/signup")
    .send({ name: "Ada Lovelace", email: "dup@example.com", password: "pass123" });

  expect(response.status).toBe(409);
});

test("sign in fails with wrong password", async () => {
  const app = require("../server");
  await request(app)
    .post("/api/signup")
    .send({ name: "Grace Hopper", email: "grace@example.com", password: "pass123" });

  const response = await request(app)
    .post("/api/signin")
    .send({ email: "grace@example.com", password: "wrong" });

  expect(response.status).toBe(401);
});

test("session endpoints work end to end", async () => {
  const app = require("../server");
  const agent = request.agent(app);

  await agent
    .post("/api/signup")
    .send({ name: "Jean Bartik", email: "jean@example.com", password: "pass123" });

  const meResponse = await agent.get("/api/me");
  expect(meResponse.body.user.email).toBe("jean@example.com");

  await agent.post("/api/signout");
  const afterSignout = await agent.get("/api/me");
  expect(afterSignout.body.user).toBe(null);
});

test("butterfly search returns results", async () => {
  const app = require("../server");
  const response = await request(app).get("/api/butterflies?q=Ulysses");
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
  expect(response.body.length).toBeGreaterThan(0);
});

test("butterfly detail returns a single record", async () => {
  const app = require("../server");
  const response = await request(app).get("/api/butterflies/1");
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty("id");
});
