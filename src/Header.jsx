import { handleLogout } from "./Auth";
function Header({
  view,
  setView,
  pendingInvites,
  selectedIcon,
  navigateTo,
  prevView,
}) {
  return (
    <header className="p-4 bg-secondary/80 backdrop-blur-md border-b border-accent-600/30 flex justify-between items-center z-50">
      <div className="flex items-center gap-4">
        {view !== "users" && (
          <button
            onClick={() => setView(prevView)}
            className="text-accent-400 font-bold mr-2 pr-4 border-r border-gray-700"
          >
            ← Back
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => navigateTo("users")}
            className={`px-4 py-2 rounded-lg text-sm transition ${view === "users" ? "bg-accent-600 shadow-neon" : "bg-gray-800 hover:bg-gray-700"}`}
          >
            Find Users
          </button>
          <button
            onClick={() => navigateTo("requests")}
            className={`px-4 py-2 rounded-lg text-sm relative transition ${view === "requests" ? "bg-accent-600 shadow-neon" : "bg-gray-800"}`}
          >
            Requests{" "}
            {pendingInvites.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {pendingInvites.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateTo("profile")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-500 border border-accent-400/50 shadow-neon hover:scale-110 transition text-xl"
        >
          {selectedIcon}
        </button>
        <button
          onClick={handleLogout}
          className="text-xs opacity-50 hover:opacity-100 transition hover:text-red-400"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
export default Header;
