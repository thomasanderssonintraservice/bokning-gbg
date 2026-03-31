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

async function notifyPowerAutomate(booking) {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new_booking",
        booking: {
          id: booking.id,
          name: booking.name,
          email: booking.email,
          serviceName: booking.serviceName,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          location: booking.location,
          notes: booking.notes,
          createdAt: booking.createdAt,
        },
      }),
    });
  } catch {
    // Webhook fel är inte kritiskt — bokningen är redan sparad
  }
}

export default async function handler(req, context) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const id = parts[2];
  const action = parts[3]; // "cancel"
  const store = getStore("bookings");

  // POST /api/bookings — publikt
  if (req.method === "POST" && !id) {
    const body = await req.json().catch(() => ({}));

    // Kontrollera att slotten finns och är ledig
    const slotsStore = getStore("slots");
    const slot = await slotsStore.get(body.slotId, { type: "json" }).catch(() => null);
    if (!slot) return json({ error: "Tidsluckan hittades inte." }, 404);
    if (slot.booked) return json({ error: "Denna tid är redan bokad. Välj en annan tid." }, 409);

    const booking = {
      id: randomUUID(),
      slotId: body.slotId,
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location || "",
      name: body.name,
      email: body.email,
      notes: body.notes || "",
      status: "confirmed",
      createdAt: Date.now(),
    };

    // Markera slotten som bokad
    await slotsStore.setJSON(slot.id, { ...slot, booked: true });
    await store.setJSON(booking.id, booking);

    // Notifiera Power Automate (asynkront, blockerar inte svaret)
    notifyPowerAutomate(booking);

    return json(booking, 201);
  }

  // Resten kräver inloggning
  const authed = await requireAuth(req);
  if (!authed) return json({ error: "Unauthorized" }, 401);

  // GET /api/bookings — admin
  if (req.method === "GET" && !id) {
    const { blobs } = await store.list().catch(() => ({ blobs: [] }));
    const items = await Promise.all(blobs.map(b => store.get(b.key, { type: "json" }).catch(() => null)));
    return json(items.filter(Boolean).sort((a, b) => a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)));
  }

  // PUT /api/bookings/:id/cancel — admin
  if (req.method === "PUT" && id && action === "cancel") {
    const booking = await store.get(id, { type: "json" }).catch(() => null);
    if (!booking) return json({ error: "Hittades inte" }, 404);

    // Frigör slotten
    const slotsStore = getStore("slots");
    const slot = await slotsStore.get(booking.slotId, { type: "json" }).catch(() => null);
    if (slot) await slotsStore.setJSON(slot.id, { ...slot, booked: false });

    const updated = { ...booking, status: "cancelled" };
    await store.setJSON(id, updated);
    return json(updated);
  }

  return json({ error: "Not found" }, 404);
}

export const config = { path: ["/api/bookings", "/api/bookings/*"] };
