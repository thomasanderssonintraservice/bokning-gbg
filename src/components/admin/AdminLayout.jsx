import { NavLink, useLocation } from "react-router-dom";

const NAV = [
  { to: "/admin", label: "Översikt", exact: true },
  { to: "/admin/bokningar", label: "Bokningar" },
  { to: "/admin/tider", label: "Lediga tider" },
  { to: "/admin/tjanster", label: "Tjänster" },
];

export default function AdminLayout({ children, onLogout }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Toppmeny */}
      <header className="bg-primary-500 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-semibold">Adminpanel – Bokningsapp</span>
          </div>
          <button onClick={onLogout} className="text-primary-200 hover:text-white text-sm transition-colors">
            Logga ut
          </button>
        </div>
        {/* Navigationsflikar */}
        <nav className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {NAV.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-white text-primary-600"
                    : "text-primary-100 hover:text-white hover:bg-primary-400"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
}
