import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import api from "../services/api.js";

// React Icons
import { MdDashboard, MdCategory, MdReviews } from "react-icons/md";
import {
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { GiPerfumeBottle } from "react-icons/gi";
import { IoChevronForward } from "react-icons/io5";
import { RiCustomerService2Line } from "react-icons/ri";
import { HiChevronRight, HiChevronLeft } from "react-icons/hi";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const menuSections = [
    {
      label: "Overview",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: <MdDashboard />
        },
        {
          name: "Analytics",
          path: "/dashboard/analytics",
          icon: <FaChartLine />
        },
      ],
    },
    {
      label: "Store Management",
      items: [
        {
          name: "Products",
          path: "/dashboard/products",
          icon: <FaBox />
        },
        {
          name: "Categories",
          path: "/dashboard/categories",
          icon: <MdCategory />
        },
        {
          name: "Orders",
          path: "/dashboard/orders",
          icon: <FaShoppingCart />
        },
        {
          name: "Customers",
          path: "/dashboard/customers",
          icon: <FaUsers />
        },
        {
          name: "Reviews",
          path: "/dashboard/reviews",
          icon: <MdReviews />
        },
      ],
    },
    {
      label: "Support",
      items: [
        {
          name: "Customer Support",
          path: "/dashboard/support",
          icon: <RiCustomerService2Line />
        },
        {
          name: "Settings",
          path: "/dashboard/settings",
          icon: <FaCog />
        },
      ],
    },
  ];

  // ✅ Get user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        let userData = localStorage.getItem('user');
        let userRole = localStorage.getItem('userRole');
        let userName = localStorage.getItem('userName');
        let userEmail = localStorage.getItem('userEmail');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser({
            name: parsedUser.name || userName || 'User',
            email: parsedUser.email || userEmail || 'No Email',
            role: parsedUser.role || userRole || 'User',
            _id: parsedUser._id || null
          });
        } else if (userName || userEmail) {
          setUser({
            name: userName || 'User',
            email: userEmail || 'No Email',
            role: userRole || 'User',
            _id: null
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout");
      localStorage.clear();
      navigate("/login", { replace: true });
    } catch (err) {
      console.log(err);
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name || name === 'User') return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    if (!user) return "User";
    return user.name || "User";
  };

  // Get user role display
  const getRoleDisplay = () => {
    if (!user) return "User";
    const roleMap = {
      'admin': 'Administrator',
      'employee': 'Employee',
      'manager': 'Manager',
      'user': 'User'
    };
    return roleMap[user.role?.toLowerCase()] || user.role || "User";
  };

  // Get user email
  const getUserEmail = () => {
    if (!user) return 'No Email';
    return user.email || 'No Email';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

        /* ── Reset & Base ── */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* ── Design tokens ── */
        :root {
          --navy:        #0a0f2c;
          --navy-mid:    #111838;
          --navy-light:  #1a2550;
          --indigo:      #6366f1;
          --indigo-dark: #4f46e5;
          --purple:      #8b5cf6;
          --indigo-dim:  rgba(99,102,241,0.14);
          --muted:       #8892b0;
          --text-soft:   #a8b4d0;
          --text-main:   #e2e8f0;
          --sw:          240px;
          --sw-collapsed: 72px;
          --trans:       0.35s cubic-bezier(.4,0,.2,1);
        }

        /* ════════════════════════════════════════
           LAYOUT SHELL
        ════════════════════════════════════════ */
        .sn-shell {
          display: flex;
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          background: linear-gradient(135deg, #06080f 0%, #0c1220 50%, #080b18 100%);
        }

        /* ════════════════════════════════════════
           SIDEBAR - Always visible
        ════════════════════════════════════════ */
        .sn-sidebar {
          width: var(--sw);
          flex-shrink: 0;
          min-height: 100vh;
          background: linear-gradient(180deg, rgba(10,15,44,0.98) 0%, rgba(17,24,56,0.98) 60%, rgba(8,11,24,0.98) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid rgba(99,102,241,0.12);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
          position: relative;
          z-index: 40;
          box-shadow: 4px 0 30px rgba(0,0,0,0.3);
          transition: width var(--trans);
          height: 100vh;
        }
        .sn-sidebar::-webkit-scrollbar { display: none; }

        .sn-sidebar.collapsed {
          width: var(--sw-collapsed);
        }

        /* decorative glow */
        .sn-sidebar::before {
          content: '';
          position: absolute;
          top: 0; 
          right: 0;
          width: 200px; 
          height: 200px;
          background: radial-gradient(circle at top right, rgba(99,102,241,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .sn-sidebar::after {
          content: '';
          position: absolute;
          bottom: 0; 
          left: 0;
          width: 200px; 
          height: 200px;
          background: radial-gradient(circle at bottom left, rgba(139,92,246,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ════════════════════════════════════════
           TOGGLE BUTTON
        ════════════════════════════════════════ */
        .sn-toggle-wrapper {
          display: flex;
          justify-content: center;
          padding: 8px 0;
          position: relative;
        }

        .sn-toggle-btn {
          width: 40px;
          height: 40px;
          color: var(--indigo);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 28px;
          outline: none;
          background: rgba(99,102,241,0.1);
          border-radius: 50%;
          border: 1px solid rgba(99,102,241,0.2);
        }

        .sn-toggle-btn:hover {
          background: rgba(99,102,241,0.25);
          border-color: rgba(99,102,241,0.5);
          transform: scale(1.1);
        }

        .sn-toggle-btn:active {
          transform: scale(0.9);
        }

        .sn-toggle-divider {
          height: 1px;
          background: linear-gradient(to right, rgba(99,102,241,0.15), rgba(99,102,241,0.05));
          margin: 4px 12px;
        }

        /* ════════════════════════════════════════
           LOGO AREA
        ════════════════════════════════════════ */
        .sn-logo {
          display: block;
          padding: 24px 20px 18px;
          border-bottom: 1px solid rgba(99,102,241,0.08);
          flex-shrink: 0;
          text-decoration: none;
          position: relative;
          transition: padding var(--trans);
        }
        .sn-sidebar.collapsed .sn-logo {
          padding: 24px 14px 18px;
        }

        .sn-logo-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          transition: gap var(--trans);
        }
        .sn-sidebar.collapsed .sn-logo-badge {
          gap: 0;
          justify-content: center;
        }

        .sn-logo-icon {
          width: 42px; 
          height: 42px;
          background: linear-gradient(135deg, var(--indigo), var(--purple));
          border-radius: 12px;
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 20px;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(99,102,241,0.3);
        }

        .sn-logo-text-wrapper {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .sn-sidebar.collapsed .sn-logo-text-wrapper {
          opacity: 0;
          transform: scale(0.8);
          width: 0;
          overflow: hidden;
        }

        .sn-logo-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(90deg, var(--indigo), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .sn-logo-sub {
          font-size: 8px;
          color: var(--muted);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-top: 3px;
          font-weight: 400;
          padding-left: 2px;
        }

        /* ════════════════════════════════════════
           NAV SECTIONS
        ════════════════════════════════════════ */
        .sn-nav { 
          flex: 1; 
          padding: 12px 0; 
          overflow-y: auto;
        }

        .sn-section { 
          padding: 4px 12px;
          transition: padding var(--trans);
        }
        .sn-sidebar.collapsed .sn-section {
          padding: 4px 6px;
        }

        .sn-section-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--muted);
          letter-spacing: 2.5px;
          text-transform: uppercase;
          padding: 10px 8px 6px;
          white-space: nowrap;
          opacity: 0.7;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .sn-sidebar.collapsed .sn-section-label {
          opacity: 0;
          transform: scale(0.8);
          height: 0;
          padding: 0;
          overflow: hidden;
        }

        .sn-divider {
          height: 1px;
          background: linear-gradient(to right, rgba(99,102,241,0.12), transparent);
          margin: 6px 8px;
        }

        /* ════════════════════════════════════════
           NAV ITEM
        ════════════════════════════════════════ */
        .sn-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          color: var(--text-soft);
          font-size: 13px;
          font-weight: 400;
          text-decoration: none;
          border-left: 3px solid transparent;
          margin-bottom: 2px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          transition: all 0.25s ease;
          position: relative;
        }
        .sn-sidebar.collapsed .sn-item {
          justify-content: center;
          padding: 10px;
        }

        .sn-item:hover {
          background: var(--indigo-dim);
          color: var(--indigo);
          padding-left: 15px;
          transform: translateX(2px);
        }
        .sn-sidebar.collapsed .sn-item:hover {
          padding-left: 10px;
          transform: translateX(0);
        }

        .sn-item.active {
          background: linear-gradient(90deg, rgba(99,102,241,0.18), rgba(99,102,241,0.04));
          color: var(--indigo);
          border-left-color: var(--indigo);
          padding-left: 9px;
          box-shadow: inset 0 0 20px rgba(99,102,241,0.05);
        }
        .sn-sidebar.collapsed .sn-item.active {
          padding-left: 10px;
        }

        .sn-item.active::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 50%;
          background: linear-gradient(to bottom, var(--indigo), var(--purple));
          border-radius: 2px 0 0 2px;
        }

        .sn-item-icon {
          font-size: 20px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .sn-item:hover .sn-item-icon,
        .sn-item.active .sn-item-icon {
          opacity: 1;
        }

        .sn-item-label {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 400;
          letter-spacing: 0.3px;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .sn-sidebar.collapsed .sn-item-label {
          opacity: 0;
          transform: scale(0.8);
          width: 0;
          overflow: hidden;
        }

        .sn-item-arrow {
          font-size: 13px;
          flex-shrink: 0;
          opacity: 0;
          color: var(--indigo);
          transition: all 0.25s ease;
        }
        .sn-item:hover .sn-item-arrow,
        .sn-item.active .sn-item-arrow {
          opacity: 1;
          transform: translateX(3px);
        }
        .sn-sidebar.collapsed .sn-item-arrow {
          display: none;
        }

        /* Tooltip for collapsed mode */
        .sn-item-tooltip {
          display: none;
          position: fixed;
          left: calc(var(--sw-collapsed) + 12px);
          background: rgba(10,15,44,0.95);
          backdrop-filter: blur(10px);
          color: var(--text-main);
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid rgba(99,102,241,0.2);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          pointer-events: none;
          white-space: nowrap;
          z-index: 100;
          transition: opacity 0.2s ease;
        }
        .sn-sidebar.collapsed .sn-item:hover .sn-item-tooltip {
          display: block;
        }

        /* ════════════════════════════════════════
           USER CARD
        ════════════════════════════════════════ */
        .sn-user {
          margin: 8px 12px 6px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          border: 1px solid rgba(99,102,241,0.08);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          min-width: 0;
          backdrop-filter: blur(10px);
          transition: all var(--trans);
        }
        .sn-sidebar.collapsed .sn-user {
          justify-content: center;
          padding: 10px;
          border: none;
          background: transparent;
        }

        .sn-avatar {
          width: 38px; 
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--indigo), var(--purple));
          display: flex; 
          align-items: center; 
          justify-content: center;
          font-size: 14px;
          color: #fff;
          font-weight: 700;
          flex-shrink: 0;
          border: 2px solid rgba(99,102,241,0.3);
        }

        .sn-user-info {
          min-width: 0;
          flex: 1;
          overflow: hidden;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .sn-sidebar.collapsed .sn-user-info {
          opacity: 0;
          transform: scale(0.8);
          width: 0;
          overflow: hidden;
        }

        .sn-user-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sn-user-email {
          font-size: 9px;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }
        .sn-user-role {
          font-size: 8px;
          color: var(--indigo);
          font-weight: 500;
          letter-spacing: 0.5px;
          margin-top: 1px;
          opacity: 0.8;
          text-transform: uppercase;
        }

        /* ════════════════════════════════════════
           LOGOUT BUTTON
        ════════════════════════════════════════ */
        .sn-logout {
          margin: 4px 12px 16px;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(99,102,241,0.12);
          background: transparent;
          color: var(--muted);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          width: calc(100% - 24px);
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.3px;
          white-space: nowrap;
          flex-shrink: 0;
          outline: none;
          transition: all 0.25s ease;
        }
        .sn-sidebar.collapsed .sn-logout {
          justify-content: center;
          padding: 10px;
          width: calc(100% - 12px);
          margin: 4px 6px 16px;
        }

        .sn-logout:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.3);
          color: #fc8181;
          transform: translateX(3px);
        }
        .sn-sidebar.collapsed .sn-logout:hover {
          transform: translateX(0);
        }

        .sn-logout:active {
          transform: scale(0.97);
        }

        .sn-logout-text {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .sn-sidebar.collapsed .sn-logout-text {
          opacity: 0;
          transform: scale(0.8);
          width: 0;
          overflow: hidden;
        }

        .sn-logout-icon {
          font-size: 18px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        /* ════════════════════════════════════════
           MAIN CONTENT
        ════════════════════════════════════════ */
        .sn-main {
          flex: 1;
          min-width: 0;
          min-height: 100vh;
          background: transparent;
          display: flex;
          flex-direction: column;
          padding: 24px;
          transition: margin-left var(--trans);
        }

        /* ════════════════════════════════════════
           RESPONSIVE - Mobile
           Sidebar always visible, arrow toggle works
        ════════════════════════════════════════ */
        @media (max-width: 768px) {
          .sn-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            height: 100vh;
            z-index: 100;
            box-shadow: 4px 0 30px rgba(0,0,0,0.5);
            border-right: 1px solid rgba(99,102,241,0.12);
          }
          
          /* On mobile, when collapsed, show only icons */
          .sn-sidebar.collapsed {
            width: var(--sw-collapsed);
          }
          
          /* On mobile, when expanded, take more width */
          .sn-sidebar:not(.collapsed) {
            width: min(280px, 85vw);
          }
          
          .sn-main {
            margin-left: var(--sw-collapsed);
            padding: 16px;
          }
        }

        /* ════════════════════════════════════════
           LOADING STATE
        ════════════════════════════════════════ */
        .sn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
        }
        .sn-loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(99,102,241,0.1);
          border-top-color: var(--indigo);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="sn-shell">

        {/* ── Sidebar ── */}
        <aside className={`sn-sidebar${isCollapsed ? " collapsed" : ""}`}>

          {/* Logo */}
          <Link to="/dashboard" className="sn-logo">
            <div className="sn-logo-badge">
              <div className="sn-logo-icon">
                <GiPerfumeBottle />
              </div>
              <div className="sn-logo-text-wrapper">
                <span className="sn-logo-text">PerfumeHub</span>
                <div className="sn-logo-sub">Admin Panel</div>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="sn-nav">
            {menuSections.map((section, si) => (
              <div key={si} className="sn-section">
                <div className="sn-section-label">{section.label}</div>

                {section.items.map((item, ii) => (
                  <NavLink
                    key={ii}
                    to={item.path}
                    className={({ isActive }) =>
                      `sn-item${isActive ? " active" : ""}`
                    }
                  >
                    <span className="sn-item-icon">{item.icon}</span>
                    <span className="sn-item-label">{item.name}</span>
                    <span className="sn-item-arrow">
                      <IoChevronForward />
                    </span>
                    {isCollapsed && (
                      <span className="sn-item-tooltip">{item.name}</span>
                    )}
                  </NavLink>
                ))}

                {/* Toggle Button - Between Store Management and Support */}
                {si === 1 && (
                  <>
                    <div className="sn-toggle-divider" />
                    <div className="sn-toggle-wrapper">
                      <button
                        className="sn-toggle-btn"
                        onClick={toggleSidebar}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                      >
                        {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
                      </button>
                    </div>
                  </>
                )}

                {si < menuSections.length - 1 && (
                  <div className="sn-divider" />
                )}
              </div>
            ))}
          </nav>

          {/* User Card */}
          {loading ? (
            <div className="sn-loading">
              <div className="sn-loading-spinner" />
            </div>
          ) : (
            <div className="sn-user">
              <div className="sn-avatar">
                {user ? getInitials(user.name) : "U"}
              </div>
              <div className="sn-user-info">
                <div className="sn-user-name">{getDisplayName()}</div>
                <div className="sn-user-email">{getUserEmail()}</div>
                <div className="sn-user-role">{getRoleDisplay()}</div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button className="sn-logout" onClick={handleLogout}>
            <span className="sn-logout-icon">
              <FaSignOutAlt />
            </span>
            <span className="sn-logout-text">Log Out</span>
          </button>

        </aside>

        {/* ── Main Content ── */}
        <main className="sn-main">
          <Outlet />
        </main>

      </div>
    </>
  );
};

export default Sidebar;