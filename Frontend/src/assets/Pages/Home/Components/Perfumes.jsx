import React from 'react'
import { GoArrowUpRight } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import { perfumeData } from "../../../commen/data.js";

const Perfumes = () => {

    const navigate = useNavigate();

    return (
        <div className='min-h-screen w-full bg-black overflow-hidden px-4 sm:px-6 lg:px-10 py-14 sm:py-20'>

            {/* Heading Section */}
            <div className="flex flex-col items-center">

                <h1 className='Syne text-[22px] sm:text-[28px] lg:text-[38px] text-gray-300 text-center max-w-[95%] sm:max-w-3xl lg:max-w-5xl tracking-tight leading-tight'>
                    Elevate Your Senses with
                    Zahoor Fragrance
                </h1>

                <img src={'/images/HomeImg/arrow.webp'} alt="arrow" className="w-12 sm:w-16 md:w-auto" />

            </div>

            {/* Cards */}
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8 mt-12">

                {perfumeData.map((item, index) => (
                    <div
                        key={index}
                        className="border border-[#A98450] p-4 sm:p-5 w-full sm:w-[330px] lg:w-[380px] flex flex-col items-center justify-center"
                    >

                        <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-[320px] sm:h-[380px] lg:h-[350px] object-cover mb-4"
                        />

                        <h1 className="text-[#A98450] text-xl sm:text-2xl Syne text-center">
                            {item.name}
                        </h1>

                        <p className="text-gray-300 text-sm sm:text-lg outfit text-center mt-1">
                            {item.desc}
                        </p>

                        <p className="text-white mt-3 Syne text-lg">
                            Rs {item.price}
                        </p>

                        <button
                            onClick={() => navigate(item.link)}
                            className='text-black bg-gray-300 py-2 px-8 sm:px-10 flex items-center mt-4 group hover:bg-black hover:border hover:border-[#A98450] active:scale-95 transition-all duration-500'
                        >

                            <span className='text-lg sm:text-2xl font-bold Syne group-hover:text-[#A98450]'>
                                Details
                            </span>

                            <span className='text-xl sm:text-2xl ml-1 translate-y-10 -translate-x-5 font-extrabold opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-[#A98450]'>
                                <GoArrowUpRight />
                            </span>

                        </button>

                    </div>
                ))}

            </div>

            {/* Explore Button */}
            <div className='flex justify-center mt-12'>

                <button
                    className='relative overflow-hidden rounded-full border-2 border-[#A98450] h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 text-[#A98450] uppercase Syne tracking-wider group flex items-center justify-center'
                >

                    {/* Background Animation */}
                    <span
                        className=' absolute inset-0 bg-[#A98450] rounded-full scale-0 group-hover:scale-100 transition-all duration-500 ease-out'
                    ></span>

                    {/* Text Wrapper */}
                    <div className='relative z-10 flex items-center justify-center'>

                        {/* First Text */}
                        <span
                            className='absolute text-[10px] sm:text-sm md:text-base whitespace-nowrap group-hover:-translate-y-5 group-hover:opacity-0 duration-500 transition-all'
                        >
                            Explore all
                        </span>

                        {/* Second Text */}
                        <span
                            className='absolute text-[10px] sm:text-sm md:text-base   whitespace-nowrap opacity-0 text-gray-300 translate-y-3 group-hover:-translate-y-1 group-hover:opacity-100 duration-500 transition-all'
                        >
                            Explore all
                        </span>

                    </div>

                </button>

            </div>

        </div>
    )
}

export default Perfumes;