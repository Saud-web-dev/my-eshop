import React from 'react'
import { PiTiktokLogo } from "react-icons/pi";
import ImageSlider3D from '../commen/Components/ImageSlider3D.jsx'

const CTA = () => {

    const sliderImages = [

        "/images/HomeImg/about.webp",
        "/images/HomeImg/Night1.webp",
        "/images/HomeImg/Night.webp",
        "/images/HomeImg/Oasis1.webp",
        "/images/HomeImg/Oasis.webp",
        "/images/HomeImg/Seductress1.webp",
        "/images/HomeImg/Seductress.webp",
        "/images/HomeImg/about.webp",
        "/images/HomeImg/Night.webp",
        "/images/HomeImg/Oasis1.webp",
        "/images/HomeImg/Seductress.webp",

    ];

    return (

        <div className='min-h-screen w-full bg-black overflow-hidden px-4 sm:px-6 lg:px-10 py-14 sm:py-20'>

            {/* Heading */}
            <div className="flex flex-col items-center gap-3">

                <h1 className='text-[#A98450] text-5xl sm:text-6xl md:text-7xl'>
                    <PiTiktokLogo />
                </h1>

                <h1 className='Syne text-[24px] sm:text-[32px] lg:text-[40px] text-gray-300 text-center max-w-[95%] sm:max-w-3xl lg:max-w-5xl uppercase tracking-tight leading-tight'>
                    Shop on TikTok
                </h1>

                <h1 className='text-[#A98450] Syne text-center flex flex-col sm:flex-row items-center gap-1 sm:gap-2'>

                    <span className='uppercase'>
                        Follow Us
                    </span>

                    <a
                        href="https://www.tiktok.com/@zahoor.fragrance"
                        target='_blank'
                        rel="noreferrer"
                        className='text-[16px] sm:text-[18px] hover:text-gray-300 transition-all duration-500'
                    >
                        @zahoor.fragrance
                    </a>

                </h1>

                <img
                    src='/images/HomeImg/arrow.webp'
                    alt="arrow"
                    className="w-12 sm:w-16 md:w-auto"
                />

            </div>

            {/* Slider */}
            <div className="mt-14 relative">
                <ImageSlider3D
                    cardWidth="300px"
                    rotationDirection="right"
                    withMask={true}
                >
                    {sliderImages.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`slider-img-${index}`}
                            className="w-full h-full object-cover rounded-xl"
                        />
                    ))}
                </ImageSlider3D>
            </div>

        </div>

    )
}

export default CTA