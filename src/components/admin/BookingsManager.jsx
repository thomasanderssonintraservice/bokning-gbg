import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";

export default function BookingsManager({ authHeader }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  function load() {
    setLoading(true);
    fetch("/api/bookings", { headers: authHeader })
      .then(r => r.json())
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function cancelBooking(id) {
    if (!confirm("Avboka detta möte?")) return;
    await fetch(`/api/bookings/${id}/cancel`, { method: "PUT", headers: authHeader });
    load();
  }

  const today = format(new Date(), "yyyy-MM-dd");

  const filtered = bookings.filter(b => {
    if (filter === "upcoming") return b.status !== "cancelled" && b.date >= today;
    if (filter === "past") return b.status !== "cancelled" && b.date < today;
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  }).sort((a, b) => a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bokningar</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "upcoming", label: "Kommande" },
          { key: "past", label: "Passerade" },
          { key: "cancelled", label: "Avbokade" },
          { key: "all", label: "Alla" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === key ? "bg-primary-500 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center text-gray-400 py-10">Inga bokningar hittades.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className={`card ${b.status === "cancelled" ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="text-center min-w-[52px]">
                  <div className="text-xs text-gray-400 uppercase">{format(parseISO(b.date), "MMM", { locale: sv })}</div>
                  <div className="text-2xl font-bold text-primary-600 leading-none">{format(parseISO(b.date), "d")}</div>
                  <div className="text-xs text-gray-400">{format(parseISO(b.date), "yyyy")}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-sm text-gray-500">{b.email}</div>
                    </div>
                    {b.status === "cancelled" ? (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Avbokad</span>
                    ) : b.date < today ? (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Genomförd</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Bekräftad</span>
                    )}
                  </div>
                  <div className="mt-1.5 text-sm text-gray-600">
                    {b.serviceName} · {b.startTime}–{b.endTime}
                    {b.location && <span> · {b.location}</span>}
                  </div>
                  {b.notes && (
                    <div className="mt-1.5 text-sm text-gray-500 bg-gray-50 rounded p-2">
                      {b.notes}
                    </div>
                  )}
                </div>
              </div>
              {b.status !== "cancelled" && b.date >= today && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => cancelBooking(b.id)} className="text-sm text-red-600 hover:underline">
                    Avboka
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
