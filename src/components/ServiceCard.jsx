import { useEffect, useState } from "react";

const COLORS = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
};

export default function ServiceCard({ onSelect }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .catch(() => setError("Kunde inte hämta tjänster. Försök igen."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  if (error) return <div className="card text-red-600 text-center py-8">{error}</div>;

  if (services.length === 0) return (
    <div className="card text-center py-12 text-gray-500">
      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p>Inga bokningsbara tjänster tillgängliga just nu.</p>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Välj typ av möte</h2>
      <p className="text-gray-500 mb-6">Välj det alternativ som passar ditt ärende.</p>
      <div className="grid gap-4">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className="card text-left hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${COLORS[s.color] || COLORS.blue}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-primary-600">{s.name}</div>
                {s.description && <div className="text-sm text-gray-500 mt-0.5">{s.description}</div>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>⏱ {s.duration} min</span>
                  {s.location && <span>📍 {s.location}</span>}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
