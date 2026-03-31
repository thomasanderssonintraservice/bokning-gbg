import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(password);
    } catch {
      setError("Fel lösenord. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Adminpanel</h1>
          <p className="text-gray-500 text-sm mt-1">Göteborgs Stad – Bokningsapp</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lösenord</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ange lösenord"
              autoFocus
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-4">
          <a href="/" className="hover:underline">← Tillbaka till bokningssidan</a>
        </p>
      </div>
    </div>
  );
}
