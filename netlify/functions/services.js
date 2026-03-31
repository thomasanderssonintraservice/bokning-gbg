import { getStore } from "@netlify/blobs";
import { randomUUID } from "crypto";

async function requireAuth(req) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;
  const sessions = getStore("sessions");
  const session = await sessions.get(token, { type: "json" }).catch(() => null);
  if (!session || session.expiresAt < Date.now()) return false;
  return true;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

export default async function handler(req, context) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean); // ["api", "services", id?]
  const id = parts[2];
  const store = getStore("services");

  // GET /api/services — publikt
  if (req.method === "GET" && !id) {
    const { blobs } = await store.list().catch(() => ({ blobs: [] }));
    const items = await Promise.all(blobs.map(b => store.get(b.key, { type: "json" }).catch(() => null)));
    return json(items.filter(Boolean).sort((a, b) => a.createdAt - b.createdAt));
  }

  // GET /api/services/:id
  if (req.method === "GET" && id) {
    const item = await store.get(id, { type: "json" }).catch(() => null);
    if (!item) return json({ error: "Hittades inte" }, 404);
    return json(item);
  }

  // Resten kräver inloggning
  const authed = await requireAuth(req);
  if (!authed) return json({ error: "Unauthorized" }, 401);

  // POST /api/services
  if (req.method === "POST" && !id) {
    const body = await req.json().catch(() => ({}));
    const service = {
      id: randomUUID(),
      name: body.name || "",
      description: body.description || "",
      duration: Number(body.duration) || 30,
      location: body.location || "",
      color: body.color || "blue",
      createdAt: Date.now(),
    };
    await store.setJSON(service.id, service);
    return json(service, 201);
  }

  // PUT /api/services/:id
  if (req.method === "PUT" && id) {
    const existing = await store.get(id, { type: "json" }).catch(() => null);
    if (!existing) return json({ error: "Hittades inte" }, 404);
    const body = await req.json().catch(() => ({}));
    const updated = { ...existing, ...body, id, createdAt: existing.createdAt };
    await store.setJSON(id, updated);
    return json(updated);
  }

  // DELETE /api/services/:id
  if (req.method === "DELETE" && id) {
    await store.delete(id).catch(() => {});
    return json({ ok: true });
  }

  return json({ error: "Not found" }, 404);
}

export const config = { path: ["/api/services", "/api/services/*"] };
