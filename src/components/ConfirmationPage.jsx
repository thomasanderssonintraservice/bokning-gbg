import { format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";
import Header from "./Header.jsx";

export default function ConfirmationPage({ booking, onReset }) {
  const formattedDate = format(parseISO(booking.date), "EEEE d MMMM yyyy", { locale: sv });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bokning bekräftad!</h1>
          <p className="text-gray-500 mb-6">En bekräftelse har skickats till {booking.email}</p>

          <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tjänst</span>
              <span className="font-medium">{booking.serviceName}</span>
            </div>
            <div className="flex justify-between text-sm capitalize">
              <span className="text-gray-500">Datum</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tid</span>
              <span className="font-medium">{booking.startTime} – {booking.endTime}</span>
            </div>
            {booking.location && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plats</span>
                <span className="font-medium">{booking.location}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Namn</span>
              <span className="font-medium">{booking.name}</span>
            </div>
          </div>

          <button onClick={onReset} className="btn-secondary w-full">
            Gör en ny bokning
          </button>
        </div>
      </main>
    </div>
  );
}
