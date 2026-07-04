import React from 'react';
import { AboutFragranceData } from '../../../commen/data';

const AboutFragrance = () => {

  return (

    <div className='min-h-screen w-full bg-[#0A0A0A] overflow-hidden py-10 sm:py-16 md:py-20'>

      {/* Header Section */}
      <div className="flex flex-col items-center justify-center text-[24px] sm:text-[30px] md:text-[40px] Syne text-gray-300 px-4 text-center">

        <h1>
          More Details For You
        </h1>

        <img src={'/images/HomeImg/arrow.webp'} alt="arrow" className="w-12 sm:w-16 md:w-auto" />

      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-1/2 px-4 sm:px-6 md:px-8 lg:px-0">

        {/* Left Side */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 py-6 sm:py-8 md:py-10">

          <h1 className='Syne text-[24px] sm:text-[28px] md:text-[32px] text-[#A98450] text-center'>
            {AboutFragranceData.h1}
          </h1>

          <img
            src={'/images/HomeImg/about.webp'}
            className='h-48 sm:h-60 md:h-72 lg:h-80 object-contain'
            alt="about"
          />

          <p className='w-full max-w-[90%] sm:max-w-[80%] md:max-w-[90%] lg:w-120 text-center outfit text-gray-300 text-sm sm:text-base md:text-lg px-4'>
            {AboutFragranceData.disc}
          </p>

        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex flex-col sm:flex-row items-center justify-center gap-0 mt-8 lg:mt-0">

          {/* Left Column */}
          <div className="w-full sm:w-auto">

            {AboutFragranceData.notes.slice(0, 2).map((item, index) => (

              <div
                key={index}
                className="w-full sm:w-72 md:w-80 h-48 sm:h-52 md:h-60 border border-[#A98450] flex flex-col justify-center p-4 sm:p-5 relative mx-auto sm:mx-0"
              >

                <h3 className="text-xl sm:text-2xl text-[#A98450] bg-[#0A0A0A] absolute -top-4 sm:-top-5 w-20 sm:w-25 flex justify-center Syne px-2">
                  {item.title}
                </h3>

                <p className="text-gray-300 text-base sm:text-lg md:text-xl outfit tracking-tight">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

          {/* Right Column */}
          <div className="w-full sm:w-auto">

            {AboutFragranceData.notes.slice(2, 4).map((item, index) => (

              <div
                key={index}
                className="w-full sm:w-72 md:w-80 h-48 sm:h-52 md:h-60 border border-[#A98450] flex flex-col justify-center p-4 sm:p-5 relative mx-auto sm:mx-0"
              >

                <h3 className="text-xl sm:text-2xl text-[#A98450] bg-[#0A0A0A] absolute -top-4 sm:-top-5 w-20 sm:w-25 flex justify-center Syne px-2">
                  {item.title}
                </h3>

                <p className="text-gray-300 text-base sm:text-lg md:text-xl outfit tracking-tight">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  );
};

export default AboutFragrance;