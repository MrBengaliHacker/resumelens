import { useState } from "react";
import { Link } from "react-router"
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const { auth } = usePuterStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">ResumeLens</p>
      </Link>

      <div className="flex flex-row items-center gap-3">
        <Link to="/upload" className="primary-button w-fit">
          Upload Resume
        </Link>

        {auth.isAuthenticated && auth.user && (
          <div className="relative">
            <button
              className="flex flex-row items-center gap-2 rounded-full bg-gray-100 pl-2 pr-3 py-1.5 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-full primary-gradient text-white text-xs font-bold uppercase shrink-0">
                {auth.user.username?.charAt(0)}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {auth.user.username}
              </span>
              <svg
                className={`w-3 h-3 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                viewBox="0 0 12 8"
                fill="none"
              >
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 z-20">
                  <Link
                    to="/wipe"
                    className="flex flex-row items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Manage my data
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar