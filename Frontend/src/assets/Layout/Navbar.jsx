import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPagesOpen, setIsPagesOpen] = useState(false);

    const location = useLocation();
    const currentPath = location.pathname;

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        {
            name: "Shop",
            path: "#",
            hasDropdown: true,
            dropdownItems: [
                { name: "Perfumes", path: "/blog" },
                { name: "Organic", path: "/faq" },
            ]
        },
        { name: "FAQ's", path: "/faq" },
    ];

    const isActive = (path) => {
        if (path === "/") return currentPath === "/";
        return currentPath === path || currentPath.startsWith(path + "/");
    };

    const handleMobileClick = () => {
        setIsMobileMenuOpen(false);
        setIsPagesOpen(false);
    };

    return (
        <nav className="w-full bg-black border-b border-[#2b2b2b] px-4 sm:px-8 lg:px-14 py-6 sticky top-0 z-50">

            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex flex-col leading-none Syne">
                    <h1 className="text-[#C89B5C] text-[22px] sm:text-[30px] font-semibold tracking-[0.18em] uppercase">
                        Zahoor
                    </h1>
                    <span className="text-gray-300 text-[11px] sm:text-[14px] tracking-[0.35em] uppercase mt-1 px-2">
                        Fragrance
                    </span>
                </Link>

                {/* Desktop Links */}
                <ul className="hidden lg:flex items-center gap-12 absolute left-1/2 -translate-x-1/2 text-[14px] tracking-[0.22em] uppercase outfit">

                    {navLinks.map((link, index) => {

                        const active = isActive(link.path);

                        return (
                            <li key={index} className="relative group flex flex-col items-center pb-6">

                                <Link
                                    to={link.path}
                                    className={`flex items-center gap-2 transition-all duration-300 ${
                                        active ? "text-[#C89B5C]" : "text-white group-hover:text-[#C89B5C]"
                                    }`}
                                >
                                    {link.name}
                                    {link.hasDropdown && <FiChevronDown />}
                                </Link>

                                <span className={`absolute bottom-2 w-16 h-[1px] bg-[#C89B5C] transition-all duration-300 ${
                                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                }`} />

                                <span className={`absolute bottom-[-12px] w-[1px] bg-[#C89B5C] transition-all duration-300 ${
                                    active ? "h-5" : "h-0 group-hover:h-5"
                                }`} />

                                {/* Dropdown */}
                                {link.hasDropdown && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-[#1a1a1a] border border-[#333] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">

                                        {link.dropdownItems.map((item, idx) => (
                                            <Link
                                                key={idx}
                                                to={item.path}
                                                className={`block px-4 py-2 text-[12px] transition-colors ${
                                                    isActive(item.path)
                                                        ? "text-[#C89B5C]"
                                                        : "text-white hover:text-[#C89B5C]"
                                                }`}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}

                                    </div>
                                )}

                            </li>
                        );
                    })}
                </ul>

                {/* Right Side */}
                <div className="flex items-center gap-5 sm:gap-8">

                    {/* Contact Desktop (ANIMATION RESTORED) */}
                    <Link
                        to="/contact"
                        className="hidden lg:flex relative group flex-col items-center pb-6 uppercase tracking-[0.22em] text-[14px]"
                    >

                        <span className={`transition-all duration-300 ${
                            isActive("/contact") ? "text-[#C89B5C]" : "text-white group-hover:text-[#C89B5C]"
                        }`}>
                            Contact
                        </span>

                        {/* horizontal line */}
                        <span className={`absolute bottom-2 w-16 h-[1px] bg-[#C89B5C] transition-all duration-300 ${
                            isActive("/contact") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`} />

                        {/* vertical line */}
                        <span className={`absolute bottom-[-12px] w-[1px] bg-[#C89B5C] transition-all duration-300 ${
                            isActive("/contact") ? "h-5" : "h-0 group-hover:h-5"
                        }`} />

                    </Link>

                    {/* Mobile Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-white"
                    >
                        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>

                </div>

            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-[#0a0a0a] border-t border-[#2b2b2b] z-50">

                    <div className="px-6 py-8 space-y-6">

                        {navLinks.map((link, index) => {

                            const active = isActive(link.path);

                            return (
                                <div key={index}>

                                    <div className="flex justify-between items-center">

                                        <Link
                                            to={link.path}
                                            onClick={handleMobileClick}
                                            className={`uppercase text-[14px] tracking-[0.22em] ${
                                                active ? "text-[#C89B5C]" : "text-white"
                                            }`}
                                        >
                                            {link.name}
                                        </Link>

                                        {link.hasDropdown && (
                                            <button
                                                onClick={() => setIsPagesOpen(!isPagesOpen)}
                                            >
                                                <FiChevronDown
                                                    className={`transition-transform ${
                                                        isPagesOpen ? "rotate-180" : ""
                                                    }`}
                                                />
                                            </button>
                                        )}

                                    </div>

                                    {/* Dropdown */}
                                    {link.hasDropdown && isPagesOpen && (
                                        <div className="mt-3 pl-4 border-l border-[#333] space-y-3">

                                            {link.dropdownItems.map((item, idx) => (
                                                <Link
                                                    key={idx}
                                                    to={item.path}
                                                    onClick={handleMobileClick}
                                                    className={`block text-[13px] ${
                                                        isActive(item.path)
                                                            ? "text-[#C89B5C]"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                        {/* Contact Mobile (ANIMATION RESTORED) */}
                        <div className="pt-4 border-t border-[#2b2b2b]">

                            <Link
                                to="/contact"
                                onClick={handleMobileClick}
                                className={`relative group flex flex-col items-start uppercase tracking-[0.22em] text-[14px] ${
                                    isActive("/contact") ? "text-[#C89B5C]" : "text-white"
                                }`}
                            >

                                <span>Contact</span>

                                <span className={`absolute bottom-0 w-14 h-[1px] bg-[#C89B5C] transition-all duration-300 ${
                                    isActive("/contact") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                }`} />

                                <span className={`absolute bottom-[-10px] w-[1px] bg-[#C89B5C] transition-all duration-300 ${
                                    isActive("/contact") ? "h-4" : "h-0 group-hover:h-4"
                                }`} />

                            </Link>

                        </div>

                    </div>
                </div>
            )}

        </nav>
    );
}