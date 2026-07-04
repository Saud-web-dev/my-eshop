import React from 'react'

const Aboutus = () => {
  return (
    <div className='min-h-screen w-full bg-black overflow-hidden px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-12 md:py-16'>

      <div className="bg-[#0A0A0A] rounded-xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-10 md:gap-12 items-center">

        {/* Left Content */}
        <div className="w-full md:w-1/2 flex flex-col gap-5 text-gray-300">

          <h2 className='text-[#A98450] text-[16px] sm:text-[18px] outfit'>
            About Us
          </h2>

          <h1 className='text-[26px] sm:text-[34px] md:text-[40px] Syne leading-tight'>
            Z. Fragrance | Crafted by{" "}
            <span className='text-[#A98450]'>Zaryab Qaiser</span>
          </h1>

          <p className='text-[14px] sm:text-[15px] md:text-[16px] outfit leading-relaxed text-left'>
            At Z. Fragrance, we believe scent is more than something you wear. It’s something that stays with you, carries your presence, and tells your story without words. Each fragrance is built around emotion, memory, and quiet elegance, shaped to reflect individuality in its purest form.

            Founded by Zaryab Qaiser Awan, Z. Fragrance was created from a genuine passion for fine aromas and thoughtful craftsmanship. The goal has always been simple: to design fragrances that feel personal, timeless, and real. Every blend is developed with care, balancing depth and clarity so it evolves naturally on the skin.

            Our collection ranges from soft everyday scents to bold signature fragrances, made for people who value authenticity and understated luxury. We work with carefully selected ingredients to ensure each bottle delivers a long-lasting and memorable experience from the first spray to the final note.
          </p>

        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <img
            src={'/images/AboutImg/Aboutimg.webp'}
            className='w-full max-w-[420px] md:max-w-[500px] object-contain'
            alt="About Z Fragrance"
          />
        </div>

      </div>

    </div>
  )
}

export default Aboutus