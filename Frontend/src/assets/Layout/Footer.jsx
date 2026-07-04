import React from 'react';
import { FaLinkedinIn, FaFacebookF, FaTwitter } from 'react-icons/fa';
import { IoLogoWhatsapp } from "react-icons/io";
import { RiTiktokFill } from "react-icons/ri";
import { RiInstagramFill } from "react-icons/ri";

const Footer = () => {
    return (
        <footer className="w-full bg-[#0a0a0a] border-t border-[#2b2b2b]">
            
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-16 sm:py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                    
                    {/* Column 1 - Brand */}
                    <div className="space-y-6">
                        <div className="flex flex-col leading-none">
                            <h2 className="text-[#C89B5C] text-[22px] sm:text-[26px] font-semibold tracking-[0.15em] uppercase outfit">
                               Z.
                            </h2>
                            <span className="text-[#C89B5C] text-[11px] sm:text-[13px] tracking-[0.4em] uppercase mt-1 Syne">
                                FRAGRANCE
                            </span>
                        </div>
                        
                        <p className="text-gray-400 text-[13px] sm:text-[14px] leading-relaxed max-w-70 outfit">
                           Discover timeless fragrances crafted to capture your individuality. Each note designed to linger, long after you’ve left the room.
                        </p>
                        
                        {/* Social Icons */}
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-[#C89B5C] hover:border-[#C89B5C] transition-all duration-300">
                                <IoLogoWhatsapp className="w-3.5 h-3.5" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-[#C89B5C] hover:border-[#C89B5C] transition-all duration-300">
                                <FaFacebookF className="w-3.5 h-3.5" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-[#C89B5C] hover:border-[#C89B5C] transition-all duration-300">
                                <RiTiktokFill className="w-3.5 h-3.5" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-[#C89B5C] hover:border-[#C89B5C] transition-all duration-300">
                                <RiInstagramFill className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2 - Quick Link */}
                    <div className="space-y-6">
                        <h3 className="text-white text-[16px] sm:text-[18px] font-medium tracking-wide outfit">
                            Quick Link
                        </h3>
                        <ul className="space-y-3.5">
                            {['Home','About Us','Shop', 'Contact Us'].map((item, index) => (
                                <li key={index}>
                                    <a href="#" className="text-gray-400 text-[13px] sm:text-[14px] hover:text-[#C89B5C] transition-colors duration-300 outfit">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3 - Utility pages */}
                    <div className="space-y-6">
                        <h3 className="text-white text-[16px] sm:text-[18px] font-medium tracking-wide outfit">
                            Utility pages
                        </h3>
                        <ul className="space-y-3.5">
                            {['Style Guide', 'Password Protected', '404 Not Found', 'Licenses', 'Changelog'].map((item, index) => (
                                <li key={index}>
                                    <a href="#" className="text-gray-400 text-[13px] sm:text-[14px] hover:text-[#C89B5C] transition-colors duration-300 outfit">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4 - Information */}
                    <div className="space-y-6">
                        <h3 className="text-white text-[16px] sm:text-[18px] font-medium tracking-wide outfit">
                            Information
                        </h3>
                        <ul className="space-y-3.5">
                            {['Terms & Condition', 'Privacy Policy', 'Cookie policy'].map((item, index) => (
                                <li key={index}>
                                    <a href="#" className="text-gray-400 text-[13px] sm:text-[14px] hover:text-[#C89B5C] transition-colors duration-300 outfit">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#2b2b2b]">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 py-5">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0 text-center">
                        <p className="text-gray-400 text-[12px] sm:text-[13px] tracking-wide outfit">
                            Copyright <span className="text-[#C89B5C]">©Z. FRAGRANCE</span>
                        </p>
                        
                        <span className="hidden sm:block mx-4 text-gray-600">|</span>
                        
                        <p className="text-gray-400 text-[12px] sm:text-[13px] tracking-wide outfit">
                            Designed by <span className="text-[#C89B5C]">SAUD AHMAD</span>
                        </p>
                        
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;