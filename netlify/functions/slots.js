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

async function getAllSlots() {
  const store = getStore("slots");
  const { blobs } = await store.list().catch(() => ({ blobs: [] }));
  const items = await Promise.all(blobs.map(b => store.get(b.key, { type: "json" }).catch(() => null)));
  return items.filter(Boolean);
}

export default async function handler(req, context) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const store = getStore("slots");

  // GET /api/slots/available-dates?serviceId=X&from=Y&to=Z — publikt
  if (req.method === "GET" && parts[2] === "available-dates") {
    const serviceId = url.searchParams.get("serviceId");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const all = await getAllSlots();
    const dates = all
      .filter(s => (!serviceId || s.serviceId === serviceId) && !s.booked && s.date >= from && s.date <= to)
      .map(s => s.date);
    return json([...new Set(dates)]);
  }

  // GET /api/slots/all — admin
  if (req.method === "GET" && parts[2] === "all") {
    const authed = await requireAuth(req);
    if (!authed) return json({ error: "Unauthorized" }, 401);
    const all = await getAllSlots();
    return json(all);
  }

  // GET /api/slots?serviceId=X&date=Y — publikt, lediga tider för en dag
  if (req.method === "GET" && !parts[2]) {
    const serviceId = url.searchParams.get("serviceId");
    const date = url.searchParams.get("date");
    const all = await getAllSlots();
    const available = all
      .filter(s => (!serviceId || s.serviceId === serviceId) && (!date || s.date === date) && !s.booked)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return json(available);
  }

  // Resten kräver inloggning
  const authed = await requireAuth(req);
  if (!authed) return json({ error: "Unauthorized" }, 401);

  // POST /api/slots
  if (req.method === "POST" && !parts[2]) {
    const body = await req.json().catch(() => ({}));
    const slot = {
      id: randomUUID(),
      serviceId: body.serviceId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      booked: false,
      createdAt: Date.now(),
    };
    await store.setJSON(slot.id, slot);
    return json(slot, 201);
  }

  // DELETE /api/slots/:id
  if (req.method === "DELETE" && parts[2]) {
    const id = parts[2];
    const slot = await store.get(id, { type: "json" }).catch(() => null);
    if (slot?.booked) return json({ error: "Kan inte ta bort en bokad tid." }, 400);
    await store.delete(id).catch(() => {});
    return json({ ok: true });
  }

  return json({ error: "Not found" }, 404);
}

export const config = { path: "/api/slots/*" };
