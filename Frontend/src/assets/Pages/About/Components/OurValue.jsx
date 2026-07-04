import React from 'react'

const OurValue = () => {
  return (
    <div className='min-h-screen w-full bg-[#0A0A0A] overflow-hidden px-4 sm:px-6 md:px-10 lg:px-16 py-10 sm:py-12 md:py-16 flex flex-col md:flex-row items-center gap-10'>

      {/* Left Image */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-start">
        <img
          src={'/images/AboutImg/perfume.webp'}
          className='w-full max-w-[420px] md:max-w-[500px] lg:max-w-[560px] object-contain'
          alt="Perfume"
        />
      </div>

      {/* Right Content */}
      <div className="w-full md:w-1/2 py-2 px-3 text-gray-300">

        <div className="flex flex-col gap-3">
          <h2 className='text-[#A98450] text-[16px] sm:text-[18px] outfit'>
            Our Value
          </h2>

          <h1 className='text-[28px] sm:text-[34px] md:text-[40px] Syne leading-tight'>
            Designed For Perfume Engineered To Last.
          </h1>

          <p className='text-[14px] sm:text-[15px] md:text-[16px] outfit leading-relaxed'>
            At Z. Fragrance, our values shape every bottle we create. We believe fragrance should feel personal, honest, and lasting, not just in scent, but in experience.
            Every fragrance is created with intention, not trends, so it reflects true character rather than imitation.
          </p>
        </div>

        <div className="flex flex-col gap-6 mt-6">

          {/* Vision */}
          <div className="flex gap-4 items-start">
            <img
              src="https://cdn.prod.website-files.com/660795973dfa1f4a6cfcaed4/660e5ed15d6052e8e656267f_icon%2001.svg"
              className="w-8 h-8 sm:w-10 sm:h-10"
              alt="Vision icon"
            />

            <div className="max-w-[520px]">
              <h1 className='Syne text-[#A98450] text-[18px]'>
                Vision
              </h1>
              <p className='outfit text-[14px] sm:text-[15px] md:text-[16px] text-gray-300'>
                Our vision is to create fragrances that go beyond scent and become part of a person’s identity.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="flex gap-4 items-start">
            <img
              src="https://cdn.prod.website-files.com/660795973dfa1f4a6cfcaed4/660e5ed1cab5259c918a7b15_Icon%2002.svg"
              className="w-8 h-8 sm:w-10 sm:h-10"
              alt="Mission icon"
            />

            <div className="max-w-[520px]">
              <h1 className='Syne text-[#A98450] text-[18px]'>
                Mission
              </h1>
              <p className='outfit text-[14px] sm:text-[15px] md:text-[16px] text-gray-300'>
                To create long-lasting, refined fragrances that express individuality and leave a memorable presence.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

export default OurValue