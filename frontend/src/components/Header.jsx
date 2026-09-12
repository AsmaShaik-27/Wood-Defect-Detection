import { Link, useLocation } from "react-router-dom"
import { killAllCameraStreams } from "../utils/camera"

export default function Header() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const handleNavClick = (path) => {
    if (path !== "/live") {
      killAllCameraStreams()
    }
  }

  return (
    <header className="bg-white/95 backdrop-blur-md text-[#1e293b] py-4 border-b border-[#e8e3da] sticky top-0 z-50 shadow-xs">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-8">
        {/* Brand Logo - Tree icon and tagline removed, font style updated */}
        <Link
          to="/"
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-1.5 group transition-transform duration-200 hover:scale-[1.02]"
        >
          <span className="text-2xl font-black tracking-tight text-[#1b4332] font-serif">
            ClearInspect
          </span>
          {/* <span className="text-xs font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#e8f5e9] border border-[#c8e6c9] text-[#1b4332]">
            AI
          </span> */}
        </Link>

        {/* Navigation Links with Hover Animations */}
        <nav className="flex items-center gap-2 sm:gap-4 text-sm">
          {/* <Link
            to="/"
            onClick={() => handleNavClick("/")}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 ${isActive("/")
                ? "text-[#1b4332] bg-[#e8f5e9] border border-[#c8e6c9] font-semibold shadow-xs"
                : "text-[#475569] hover:text-[#1b4332] hover:bg-[#f1ede6] hover:shadow-xs"
              }`}
          >
            Home
          </Link> */}

          <Link
            to="/live"
            onClick={() => handleNavClick("/live")}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 ${isActive("/live") || isActive("/demo")
              ? "text-white bg-[#1b4332] shadow-sm font-semibold"
              : "text-[#475569] hover:text-[#1b4332] hover:bg-[#f1ede6] hover:shadow-xs"
              }`}
          >
            Live Cam
          </Link>

          <Link
            to="/upload"
            onClick={() => handleNavClick("/upload")}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 ${isActive("/upload")
              ? "text-white bg-[#1b4332] shadow-sm font-semibold"
              : "text-[#475569] hover:text-[#1b4332] hover:bg-[#f1ede6] hover:shadow-xs"
              }`}
          >
            Upload Image
          </Link>
        </nav>
      </div>
    </header>
  )
}