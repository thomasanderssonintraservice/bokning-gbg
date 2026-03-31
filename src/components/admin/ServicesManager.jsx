import { useEffect, useState } from "react";

const COLORS = ["blue", "green", "purple", "orange", "red"];
const COLOR_LABELS = { blue: "Blå", green: "Grön", purple: "Lila", orange: "Orange", red: "Röd" };

const EMPTY = { name: "", description: "", duration: 30, location: "", color: "blue" };

export default function ServicesManager({ authHeader }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startEdit(service) {
    setEditing(service.id);
    setForm({ name: service.name, description: service.description || "", duration: service.duration, location: service.location || "", color: service.color || "blue" });
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
  }

  async function save() {
    if (!form.name.trim()) { setError("Namn är obligatoriskt."); return; }
    setSaving(true);
    setError(null);
    try {
      const isNew = editing === "new";
      const url = isNew ? "/api/services" : `/api/services/${editing}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Fel vid sparning.");
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id) {
    if (!confirm("Ta bort tjänsten? Befintliga bokningar påverkas inte.")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE", headers: authHeader });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tjänster</h1>
        {!editing && editing !== "new" && (
          <button onClick={() => { setEditing("new"); setForm(EMPTY); }} className="btn-primary">
            + Ny tjänst
          </button>
        )}
      </div>

      {/* Formulär */}
      {editing !== null && (
        <div className="card mb-6">
          <h2 className="font-semibold mb-4">{editing === "new" ? "Ny tjänst" : "Redigera tjänst"}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Namn *</label>
              <input className="input" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="T.ex. Rådgivningsmöte" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
              <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kort beskrivning..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Längd (minuter)</label>
              <input className="input" type="number" min={5} max={480} step={5} value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Färg</label>
              <select className="input" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}>
                {COLORS.map(c => <option key={c} value={c}>{COLOR_LABELS[c]}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plats / Teams-länk</label>
              <input className="input" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} placeholder="T.ex. Rum 201 eller https://teams.microsoft.com/..." />
            </div>
          </div>
          {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving} className="btn-primary">{saving ? "Sparar..." : "Spara"}</button>
            <button onClick={cancelEdit} className="btn-secondary">Avbryt</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : services.length === 0 ? (
        <div className="card text-center text-gray-400 py-10">Inga tjänster skapade ännu.</div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className="card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-gray-500">{s.duration} min{s.location ? ` · ${s.location}` : ""}</div>
                {s.description && <div className="text-xs text-gray-400 mt-0.5">{s.description}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="btn-secondary text-sm py-1.5 px-3">Redigera</button>
                <button onClick={() => deleteService(s.id)} className="btn-danger text-sm py-1.5 px-3">Ta bort</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
