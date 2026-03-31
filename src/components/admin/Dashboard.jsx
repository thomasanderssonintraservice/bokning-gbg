import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";

export default function Dashboard({ authHeader }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings", { headers: authHeader })
      .then((r) => r.json())
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const upcoming = bookings.filter((b) => b.status !== "cancelled" && b.date >= today);
  const todayBookings = bookings.filter((b) => b.status !== "cancelled" && b.date === today);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Översikt</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Bokningar idag" value={todayBookings.length} color="blue" />
            <StatCard label="Kommande bokningar" value={upcoming.length} color="green" />
            <StatCard label="Totalt antal bokningar" value={bookings.filter(b => b.status !== "cancelled").length} color="gray" />
          </div>

          <h2 className="text-lg font-semibold mb-3">Närmaste bokningar</h2>
          {upcoming.length === 0 ? (
            <div className="card text-center text-gray-400 py-8">Inga kommande bokningar.</div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 10).map((b) => (
                <div key={b.id} className="card flex items-center gap-4">
                  <div className="text-center min-w-[52px]">
                    <div className="text-xs text-gray-400 uppercase">
                      {format(parseISO(b.date), "MMM", { locale: sv })}
                    </div>
                    <div className="text-2xl font-bold text-primary-600 leading-none">
                      {format(parseISO(b.date), "d")}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{b.name}</div>
                    <div className="text-sm text-gray-500">{b.serviceName} · {b.startTime}–{b.endTime}</div>
                    <div className="text-xs text-gray-400">{b.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    gray: "bg-gray-50 text-gray-700",
  };
  return (
    <div className="card">
      <div className={`text-3xl font-bold ${colors[color]?.split(" ")[1] || "text-gray-700"}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
