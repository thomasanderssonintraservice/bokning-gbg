import { useState } from "react";
import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";

export default function BookingForm({ service, date, slot, onConfirm, onBack }) {
  const [form, setForm] = useState({ name: "", email: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formattedDate = format(parseISO(date), "EEEE d MMMM yyyy", { locale: sv });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Namn och e-post är obligatoriska.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot.id,
          serviceId: service.id,
          serviceName: service.name,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          location: service.location,
          name: form.name.trim(),
          email: form.email.trim(),
          notes: form.notes.trim(),
        }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({}));
        throw new Error(msg || "Bokningen misslyckades. Försök igen.");
      }
      const booking = await res.json();
      onConfirm(booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Dina uppgifter</h2>

      {/* Sammanfattning */}
      <div className="card bg-primary-50 border-primary-200 mb-6">
        <div className="text-sm text-primary-800 space-y-1">
          <div><span className="font-medium">Tjänst:</span> {service.name}</div>
          <div className="capitalize"><span className="font-medium">Datum:</span> {formattedDate}</div>
          <div><span className="font-medium">Tid:</span> {slot.startTime} – {slot.endTime}</div>
          {service.location && <div><span className="font-medium">Plats:</span> {service.location}</div>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Namn *</label>
          <input
            className="input"
            type="text"
            placeholder="Förnamn Efternamn"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-postadress *</label>
          <input
            className="input"
            type="email"
            placeholder="namn@exempel.se"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <p className="text-xs text-gray-400 mt-1">En bokningsbekräftelse skickas hit.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meddelande (valfritt)</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Beskriv kortfattat ditt ärende..."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Bokar..." : "Bekräfta bokning"}
        </button>
      </form>

      <button onClick={onBack} className="btn-secondary mt-3 w-full">← Tillbaka</button>
    </div>
  );
}
