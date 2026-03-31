import { getStore } from "@netlify/blobs";
import { randomBytes } from "crypto";

const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 timmar

async function verifyToken(token) {
  if (!token) return false;
  const sessions = getStore("sessions");
  const session = await sessions.get(token, { type: "json" }).catch(() => null);
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    await sessions.delete(token).catch(() => {});
    return false;
  }
  return true;
}

export default async function handler(req, context) {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/auth", "");

  // POST /api/auth/login
  if (req.method === "POST" && path === "/login") {
    const { password } = await req.json().catch(() => ({}));
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return new Response(JSON.stringify({ error: "Fel lösenord" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const token = randomBytes(32).toString("hex");
    const sessions = getStore("sessions");
    await sessions.setJSON(token, { createdAt: Date.now(), expiresAt: Date.now() + SESSION_TTL });
    return Response.json({ token });
  }

  // POST /api/auth/logout
  if (req.method === "POST" && path === "/logout") {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (token) {
      const sessions = getStore("sessions");
      await sessions.delete(token).catch(() => {});
    }
    return Response.json({ ok: true });
  }

  // GET /api/auth/verify
  if (req.method === "GET" && path === "/verify") {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const valid = await verifyToken(token);
    if (!valid) return new Response("Unauthorized", { status: 401 });
    return Response.json({ ok: true });
  }

  return new Response("Not Found", { status: 404 });
}

export const config = { path: "/api/auth/*" };
