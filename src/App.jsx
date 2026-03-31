import { Routes, Route } from "react-router-dom";
import BookingPage from "./pages/BookingPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<BookingPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  );
}
