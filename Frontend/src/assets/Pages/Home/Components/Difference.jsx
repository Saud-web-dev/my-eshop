import React from 'react'

import {
    differenceHeading,
    leftFeatures,
    rightDetails,
    differenceImage
} from "../../../commen/data.js";

const Difference = () => {

    return (

        <div className='min-h-screen w-full bg-[#0A0A0A] overflow-hidden px-4 sm:px-6 md:px-10 lg:px-15 py-10 sm:py-12 md:py-15'>

            {/* Heading */}
            <div className="flex flex-col items-center mb-10 sm:mb-14 md:mb-16 lg:mb-20">

                <h1 className='Syne text-[20px] sm:text-[24px] md:text-[28px] lg:text-[38px] text-gray-300 text-center max-w-[95%] sm:max-w-2xl md:max-w-3xl lg:max-w-5xl tracking-tight leading-tight'>
                    {differenceHeading.title}
                </h1>

                <img src={'/images/HomeImg/arrow.webp'} alt="arrow" className="w-12 sm:w-16 md:w-auto" />

            </div>

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12">

                {/* Left Side */}
                <div className="w-full lg:w-[32%] flex flex-col gap-6 sm:gap-8 md:gap-10 order-1">

                    {leftFeatures.map((feature, index) => (

                        <div
                            key={index}
                            className="flex items-center gap-2 sm:gap-3"
                        >

                            <span className="text-[#A98450] text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] font-medium tracking-wider whitespace-nowrap mt-4 sm:mt-5 Syne">
                                {feature.version}
                            </span>

                            <div className="flex-1 flex flex-col justify-center">

                                <h3 className="text-gray-300 text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] font-medium tracking-wide mb-4 sm:mb-5 Syne">
                                    {feature.label}
                                </h3>

                                <div className="h-[1px] bg-[#A98450] w-full mb-1"></div>

                            </div>

                        </div>

                    ))}

                </div>

                {/* Center Image */}
                <div className="w-full lg:w-[30%] flex justify-center items-center order-2">

                    <img
                        src={differenceImage.img}
                        alt="Woman with perfume"
                        className="w-60 h-90 sm:w-72 sm:h-108 md:w-80 md:h-100 object-cover rounded-sm"
                    />

                </div>

                {/* Right Side */}
                <div className="w-full lg:w-[28%] flex flex-col gap-6 sm:gap-8 md:gap-10 order-3">

                    {rightDetails.map((detail, index) => (

                        <div
                            key={index}
                            className="flex flex-col gap-1"
                        >

                            <h3 className="text-gray-300 text-[18px] sm:text-[20px] lg:text-[22px] font-semibold tracking-wide Syne">
                                {detail.label}
                            </h3>

                            <p className="text-[#A98450] text-[14px] sm:text-[15px] lg:text-[16px] font-medium tracking-[0.2em] uppercase outfit">
                                {detail.value}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    )
}

export default Difference