import { useState } from "react";
import Header from "../components/Header.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import CalendarPicker from "../components/CalendarPicker.jsx";
import TimeSlotGrid from "../components/TimeSlotGrid.jsx";
import BookingForm from "../components/BookingForm.jsx";
import ConfirmationPage from "../components/ConfirmationPage.jsx";

const STEPS = ["Välj tjänst", "Välj datum", "Välj tid", "Dina uppgifter"];

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState(null);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [booking, setBooking] = useState(null);

  if (booking) return <ConfirmationPage booking={booking} onReset={() => { setStep(0); setService(null); setDate(null); setSlot(null); setBooking(null); }} />;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Steg-indikator */}
        <div className="flex items-center mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  i < step ? "bg-primary-500 border-primary-500 text-white"
                  : i === step ? "border-primary-500 text-primary-500 bg-white"
                  : "border-gray-300 text-gray-400 bg-white"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`mt-1 text-xs hidden sm:block ${i === step ? "text-primary-600 font-medium" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? "bg-primary-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {step === 0 && (
          <ServiceCard onSelect={(s) => { setService(s); setStep(1); }} />
        )}
        {step === 1 && service && (
          <CalendarPicker
            serviceId={service.id}
            onSelect={(d) => { setDate(d); setStep(2); }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && service && date && (
          <TimeSlotGrid
            serviceId={service.id}
            date={date}
            onSelect={(s) => { setSlot(s); setStep(3); }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && service && date && slot && (
          <BookingForm
            service={service}
            date={date}
            slot={slot}
            onConfirm={setBooking}
            onBack={() => setStep(2)}
          />
        )}
      </main>
    </div>
  );
}
