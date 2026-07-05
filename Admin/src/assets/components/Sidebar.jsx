import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
      ],
    },
    {
      label: "Store Management",
      items: [
        {
          name: "Products",
          path: "/products",
          icon: <FaBox />
        },
        {
          name: "Categories",
          path: "/categories",
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
      label: "Reports",
      items: [
        {
          name: "Reports",
          path: "/dashboard/reports",
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

  // Get user data from localStorage
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getInitials = (name) => {
    if (!name || name === 'User') return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (!user) return "User";
    return user.name || "User";
  };

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

  const getUserEmail = () => {
    if (!user) return 'No Email';
    return user.email || 'No Email';
  };

  // Animation variants
  const sidebarVariants = {
    expanded: {
      width: "240px",
      transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
    },
    collapsed: {
      width: "72px",
      transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const textVariants = {
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hidden: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  const sectionLabelVariants = {
    visible: {
      opacity: 0.7,
      height: "auto",
      padding: "10px 8px 6px",
      transition: { duration: 0.3 }
    },
    hidden: {
      opacity: 0,
      height: 0,
      padding: 0,
      transition: { duration: 0.3 }
    }
  };

  const userInfoVariants = {
    visible: {
      opacity: 1,
      scale: 1,
      width: "auto",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hidden: {
      opacity: 0,
      scale: 0.8,
      width: 0,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  const logoutTextVariants = {
    visible: {
      opacity: 1,
      scale: 1,
      width: "auto",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hidden: {
      opacity: 0,
      scale: 0.8,
      width: 0,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  const itemLabelVariants = {
    visible: {
      opacity: 1,
      scale: 1,
      width: "auto",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hidden: {
      opacity: 0,
      scale: 0.8,
      width: 0,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  return (
    <div className="flex min-h-screen font-['Montserrat'] bg-gradient-to-br from-[#06080f] via-[#0c1220] to-[#080b18] overflow-hidden">
      {/* ── Sidebar ── */}
      <motion.aside
        variants={sidebarVariants}
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        className="relative flex flex-col h-screen overflow-hidden border-r border-[rgba(99,102,241,0.12)] bg-gradient-to-b from-[rgba(10,15,44,0.98)] via-[rgba(17,24,56,0.98)] to-[rgba(8,11,24,0.98)] backdrop-blur-[20px] shadow-[4px_0_30px_rgba(0,0,0,0.3)] z-40 flex-shrink-0"
      >
        {/* ── Logo ── */}
        <Link 
          to="/dashboard" 
          className={`block border-b border-[rgba(99,102,241,0.08)] flex-shrink-0 transition-padding duration-300 ${
            isCollapsed ? 'px-[14px] py-6' : 'px-5 py-6'
          }`}
        >
          <div className={`flex items-center transition-gap duration-300 ${
            isCollapsed ? 'gap-0 justify-center' : 'gap-3'
          }`}>
            <div className="w-[42px] h-[42px] flex items-center justify-center bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl text-white text-xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] flex-shrink-0">
              <GiPerfumeBottle />
            </div>
            <motion.div
              variants={textVariants}
              initial="visible"
              animate={isCollapsed ? "hidden" : "visible"}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-['Montserrat'] text-lg font-semibold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent tracking-[0.5px]">
                PerfumeHub
              </span>
              <div className="text-[8px] text-[#8892b0] tracking-[3px] uppercase font-normal mt-1 pl-0.5">
                Admin Panel
              </div>
            </motion.div>
          </div>
        </Link>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-none">
          {menuSections.map((section, si) => (
            <div key={si} className={`transition-padding duration-300 ${
              isCollapsed ? 'px-1.5' : 'px-3'
            }`}>
              <motion.div
                variants={sectionLabelVariants}
                initial="visible"
                animate={isCollapsed ? "hidden" : "visible"}
                className="text-[9px] font-semibold text-[#8892b0] tracking-[2.5px] uppercase whitespace-nowrap overflow-hidden"
              >
                {section.label}
              </motion.div>

              {section.items.map((item, ii) => (
                <NavLink
                  key={ii}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-normal text-[#a8b4d0] border-l-3 border-transparent mb-0.5 whitespace-nowrap overflow-hidden cursor-pointer transition-all duration-200 relative ${
                      isActive 
                        ? 'bg-gradient-to-r from-[rgba(99,102,241,0.18)] to-[rgba(99,102,241,0.04)] text-[#6366f1] border-l-[#6366f1] shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' 
                        : ''
                    } ${
                      isCollapsed ? 'justify-center px-2.5' : ''
                    } hover:bg-[rgba(99,102,241,0.14)] hover:text-[#6366f1] ${
                      isCollapsed ? '' : 'hover:pl-4 hover:translate-x-0.5'
                    }`
                  }
                >
                  <span className="text-xl flex-shrink-0 flex items-center opacity-80 group-hover:opacity-100 [&.active]:opacity-100">
                    {item.icon}
                  </span>
                  <motion.span
                    variants={itemLabelVariants}
                    initial="visible"
                    animate={isCollapsed ? "hidden" : "visible"}
                    className="flex-1 min-w-0 overflow-hidden text-ellipsis font-normal tracking-[0.3px]"
                  >
                    {item.name}
                  </motion.span>
                  <span className={`text-[13px] flex-shrink-0 text-[#6366f1] transition-all duration-200 ${
                    isCollapsed ? 'hidden' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-active:opacity-100 group-active:translate-x-1'
                  }`}>
                    <IoChevronForward />
                  </span>
                  {isCollapsed && (
                    <span className="hidden group-hover:block fixed left-[84px] bg-[rgba(10,15,44,0.95)] backdrop-blur-[10px] text-[#e2e8f0] px-3.5 py-1.5 rounded-md text-[13px] font-medium border border-[rgba(99,102,241,0.2)] shadow-[0_4px_20px_rgba(0,0,0,0.3)] pointer-events-none whitespace-nowrap z-[100] transition-opacity duration-200">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              ))}

              {/* ── Toggle Button ── */}
              {si === 1 && (
                <>
                  <div className="h-px bg-gradient-to-r from-[rgba(99,102,241,0.15)] to-[rgba(99,102,241,0.05)] my-1 mx-3" />
                  <div className="flex justify-center py-2">
                    <button
                      className="w-10 h-10 flex items-center justify-center text-[#6366f1] cursor-pointer transition-all duration-200 text-[28px] outline-none bg-[rgba(99,102,241,0.1)] rounded-full border border-[rgba(99,102,241,0.2)] hover:bg-[rgba(99,102,241,0.25)] hover:border-[rgba(99,102,241,0.5)] hover:scale-110 active:scale-90"
                      onClick={toggleSidebar}
                      title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                      {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
                    </button>
                  </div>
                </>
              )}

              {si < menuSections.length - 1 && (
                <div className="h-px bg-gradient-to-r from-[rgba(99,102,241,0.12)] to-transparent my-1.5 mx-2" />
              )}
            </div>
          ))}
        </nav>

        {/* ── User Card ── */}
        {loading ? (
          <div className="flex items-center justify-center py-2 flex-shrink-0">
            <div className="w-5 h-5 border-2 border-[rgba(99,102,241,0.1)] border-t-[#6366f1] rounded-full animate-spin" />
          </div>
        ) : (
          <div className={`mx-3 my-2 p-2.5 flex items-center gap-3 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(99,102,241,0.08)] backdrop-blur-[10px] flex-shrink-0 min-w-0 transition-all duration-300 ${
            isCollapsed ? 'justify-center p-2.5 border-none bg-transparent' : ''
          }`}>
            <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white text-sm font-bold flex-shrink-0 border-2 border-[rgba(99,102,241,0.3)]">
              {user ? getInitials(user.name) : "U"}
            </div>
            <motion.div
              variants={userInfoVariants}
              initial="visible"
              animate={isCollapsed ? "hidden" : "visible"}
              className="min-w-0 flex-1 overflow-hidden"
            >
              <div className="text-xs font-medium text-[#e2e8f0] whitespace-nowrap overflow-hidden text-ellipsis">
                {getDisplayName()}
              </div>
              <div className="text-[9px] text-[#8892b0] whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">
                {getUserEmail()}
              </div>
              <div className="text-[8px] text-[#6366f1] font-medium tracking-[0.5px] mt-0.5 opacity-80 uppercase">
                {getRoleDisplay()}
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Logout ── */}
        <button
          className={`flex items-center gap-3 px-3.5 py-2.5 mx-3 mb-4 rounded-xl border border-[rgba(99,102,241,0.12)] bg-transparent text-[#8892b0] text-[13px] font-medium cursor-pointer font-['Montserrat'] tracking-[0.3px] whitespace-nowrap flex-shrink-0 outline-none transition-all duration-200 ${
            isCollapsed ? 'justify-center px-2.5 mx-1.5 mb-4' : ''
          } hover:bg-[rgba(239,68,68,0.08)] hover:border-[rgba(239,68,68,0.3)] hover:text-[#fc8181] ${
            isCollapsed ? '' : 'hover:translate-x-1'
          } active:scale-97`}
          onClick={handleLogout}
        >
          <span className="text-lg flex items-center flex-shrink-0">
            <FaSignOutAlt />
          </span>
          <motion.span
            variants={logoutTextVariants}
            initial="visible"
            animate={isCollapsed ? "hidden" : "visible"}
            className="overflow-hidden whitespace-nowrap"
          >
            Log Out
          </motion.span>
        </button>
      </motion.aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 min-h-screen bg-transparent flex flex-col p-6 transition-margin duration-300 md:ml-[72px] overflow-y-auto">
        <Outlet />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
        
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        @media (max-width: 768px) {
          main {
            margin-left: 72px;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;