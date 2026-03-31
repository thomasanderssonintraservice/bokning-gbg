import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";

export default function TimeSlotGrid({ serviceId, date, onSelect, onBack }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/slots?serviceId=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [serviceId, date]);

  const formattedDate = format(parseISO(date), "EEEE d MMMM yyyy", { locale: sv });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1">Välj tid</h2>
      <p className="text-gray-500 mb-6 capitalize">{formattedDate}</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : slots.length === 0 ? (
        <div className="card text-center py-10 text-gray-500">
          Inga lediga tider detta datum. Välj ett annat datum.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSelect(slot)}
              className="card hover:border-primary-400 hover:bg-primary-50 hover:shadow-md transition-all text-center py-4 group"
            >
              <div className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                {slot.startTime}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">–{slot.endTime}</div>
            </button>
          ))}
        </div>
      )}

      <button onClick={onBack} className="btn-secondary mt-6 w-full">← Tillbaka</button>
    </div>
  );
}
