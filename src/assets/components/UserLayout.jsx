import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../styles/user-layout.css";
import logo from "../../assets/logo.png";

export default function UserLayout({ children }) {
  const canvasRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountRef = useRef(null);
  const sidebarAccountRef = useRef(null);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("authUser") || "{}");
  const user = {
    name: storedUser.username || storedUser.name || "User",
    email: storedUser.email || "",
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/");
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        accountRef.current && !accountRef.current.contains(e.target) &&
        sidebarAccountRef.current && !sidebarAccountRef.current.contains(e.target)
      ) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    const COLORS = ['#38bdf8', '#818cf8', '#6366f1', '#22d3ee', '#a78bfa'];
    const pts = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      baseAlpha: Math.random() * 0.28 + 0.10,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.3 + 0.08),
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.006,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.twinkle += p.twinkleSpeed;
        const a = p.baseAlpha * (0.5 + 0.5 * Math.sin(p.twinkle));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.fill();
        ctx.globalAlpha = 1;
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        if (p.x < -4) p.x = canvas.width + 4;
        if (p.x > canvas.width + 4) p.x = -4;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', handleResize); };
  }, []);

  const navLinks = [
    { to: "/landing", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/history", label: "History" },
  ];

  return (
    <div className="user-layout">
      <canvas ref={canvasRef} className="particles-canvas" />

      {/* HEADER */}
      <header className="user-header">
        <Link to="/landing" className="logo-wrap">
          <img src={logo} alt="VeriFake" className="logo-img" />
          <span className="logo-text">VeriFake</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="header-nav">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`header-nav-item ${location.pathname === to ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-spacer" />

        {/* DESKTOP ACCOUNT */}
        <div className="header-account" ref={accountRef}>
          <div className="user-avatar-sm" onClick={() => setShowAccountMenu(!showAccountMenu)}>
            {user.name.charAt(0)}
          </div>

          {showAccountMenu && (
            <div className="account-menu">
              <div className="account-menu-info">
                <p className="account-menu-name">{user.name}</p>
                <p className="account-menu-email">{user.email}</p>
              </div>
              <div className="account-menu-divider" />
              <Link to="/settings" className="account-menu-item" onClick={() => setShowAccountMenu(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Settings
              </Link>
              <button className="account-menu-item logout" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <div className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </div>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

      {/* MOBILE SIDEBAR */}
      <aside className={`user-sidebar ${menuOpen ? 'open' : ''}`}>
        <Link to="/landing" className="logo-wrap" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="VeriFake" className="logo-img" />
          <span className="logo-text">VeriFake</span>
        </Link>

        <nav className="user-nav">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-item ${location.pathname === to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* SIDEBAR ACCOUNT SECTION */}
        <div className="sidebar-bottom" ref={sidebarAccountRef}>
          <div
            className="sidebar-user-info"
            onClick={() => setShowAccountMenu(!showAccountMenu)}
          >
            <div className="user-avatar">{user.name.charAt(0)}</div>
            <div className="sidebar-user-details">
              <p className="user-name">{user.name}</p>
              <p className="user-email">{user.email}</p>
            </div>
            <svg
              className="sidebar-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: showAccountMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }}
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </div>

          {showAccountMenu && (
            <div className="sidebar-account-menu">
              <Link
                to="/settings"
                className="account-menu-item"
                onClick={() => { setShowAccountMenu(false); setMenuOpen(false); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Settings
              </Link>
              <button
                className="account-menu-item logout"
                onClick={() => { handleLogout(); setMenuOpen(false); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* PAGE CONTENT */}
      <div className="user-page-content">
        <main className="user-page-main">
          {children}
        </main>
      </div>
    </div>
  );
}
