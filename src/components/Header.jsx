export default function Header() {
  return (
    <header className="bg-primary-500 text-white shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <div className="font-semibold text-lg leading-tight">Boka möte</div>
          <div className="text-primary-200 text-sm">Göteborgs Stad</div>
        </div>
      </div>
    </header>
  );
}
