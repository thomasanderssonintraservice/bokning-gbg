import { useEffect, useState } from "react";
import { format, parseISO, addMinutes } from "date-fns";
import { sv } from "date-fns/locale";

export default function SlotsManager({ authHeader }) {
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ serviceId: "", date: "", startTime: "09:00", repeat: 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/services").then(r => r.json()),
      fetch("/api/slots/all", { headers: authHeader }).then(r => r.json()),
    ])
      .then(([svcs, sls]) => { setServices(svcs); setSlots(sls); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  // Beräkna sluttid baserat på tjänstens längd
  function getEndTime(serviceId, startTime) {
    const service = services.find(s => s.id === serviceId);
    if (!service) return "";
    const [h, m] = startTime.split(":").map(Number);
    const start = new Date(2000, 0, 1, h, m);
    const end = addMinutes(start, service.duration);
    return format(end, "HH:mm");
  }

  async function createSlot() {
    if (!form.serviceId || !form.date || !form.startTime) {
      setError("Fyll i alla obligatoriska fält."); return;
    }
    setSaving(true);
    setError(null);
    try {
      const endTime = getEndTime(form.serviceId, form.startTime);
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ serviceId: form.serviceId, date: form.date, startTime: form.startTime, endTime }),
      });
      if (!res.ok) throw new Error("Kunde inte skapa tid.");
      setForm(f => ({ ...f, startTime: endTime })); // föreslå nästa tid
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSlot(id) {
    await fetch(`/api/slots/${id}`, { method: "DELETE", headers: authHeader });
    load();
  }

  const filteredSlots = filterDate
    ? slots.filter(s => s.date === filterDate)
    : slots;

  const sortedSlots = [...filteredSlots].sort((a, b) =>
    a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Lediga tider</h1>

      {/* Skapa ny tid */}
      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Lägg till ledig tid</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tjänst *</label>
            <select className="input" value={form.serviceId} onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}>
              <option value="">Välj tjänst...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
            <input className="input" type="date" value={form.date} min={format(new Date(), "yyyy-MM-dd")} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starttid *</label>
            <input className="input" type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          </div>
        </div>
        {form.serviceId && form.startTime && (
          <p className="text-sm text-gray-500 mt-2">
            Sluttid: {getEndTime(form.serviceId, form.startTime)}
          </p>
        )}
        {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
        <button onClick={createSlot} disabled={saving} className="btn-primary mt-4">
          {saving ? "Sparar..." : "+ Lägg till tid"}
        </button>
      </div>

      {/* Filtrera */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-medium text-gray-700">Filtrera datum:</label>
        <input className="input w-auto" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        {filterDate && <button onClick={() => setFilterDate("")} className="text-sm text-gray-400 hover:text-gray-700">Rensa</button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : sortedSlots.length === 0 ? (
        <div className="card text-center text-gray-400 py-10">Inga tider skapade.</div>
      ) : (
        <div className="space-y-2">
          {sortedSlots.map((slot) => {
            const service = services.find(s => s.id === slot.serviceId);
            return (
              <div key={slot.id} className={`card flex items-center gap-4 py-3 ${slot.booked ? "opacity-60" : ""}`}>
                <div className="min-w-[90px]">
                  <div className="text-xs text-gray-400">{format(parseISO(slot.date), "EEE d MMM", { locale: sv })}</div>
                  <div className="font-semibold">{slot.startTime}–{slot.endTime}</div>
                </div>
                <div className="flex-1 text-sm text-gray-600">{service?.name || "Okänd tjänst"}</div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${slot.booked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {slot.booked ? "Bokad" : "Ledig"}
                </div>
                {!slot.booked && (
                  <button onClick={() => deleteSlot(slot.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
