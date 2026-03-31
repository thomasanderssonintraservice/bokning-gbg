import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isBefore, startOfDay } from "date-fns";
import { sv } from "date-fns/locale";

export default function CalendarPicker({ serviceId, onSelect, onBack }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const from = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const to = format(endOfMonth(currentMonth), "yyyy-MM-dd");
    fetch(`/api/slots/available-dates?serviceId=${serviceId}&from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((dates) => setAvailableDates(new Set(dates)))
      .catch(() => setAvailableDates(new Set()))
      .finally(() => setLoading(false));
  }, [serviceId, currentMonth]);

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDayOfWeek = (getDay(days[0]) + 6) % 7; // måndag = 0
  const today = startOfDay(new Date());

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Välj datum</h2>
      <p className="text-gray-500 mb-6">Markerade dagar har lediga tider.</p>
      <div className="card">
        {/* Månadsnavigering */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: sv })}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Veckodagsrubriker */}
        <div className="grid grid-cols-7 mb-2">
          {["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Dagar */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e${i}`} />)}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const available = availableDates.has(dateStr);
              const past = isBefore(day, today);
              const sameMonth = isSameMonth(day, currentMonth);
              return (
                <button
                  key={dateStr}
                  disabled={!available || past}
                  onClick={() => onSelect(dateStr)}
                  className={`aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center
                    ${!sameMonth ? "opacity-30" : ""}
                    ${available && !past
                      ? "bg-primary-500 text-white hover:bg-primary-600 cursor-pointer"
                      : past
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <button onClick={onBack} className="btn-secondary mt-4 w-full">← Tillbaka</button>
    </div>
  );
}
