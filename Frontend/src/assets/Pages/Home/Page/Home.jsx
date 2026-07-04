import React from 'react'
import Hero from '../Components/Hero'
import AboutFragrance from '../Components/AboutFragrance'
import Perfumes from '../Components/Perfumes'
import Difference from '../Components/Difference'
import CTA from '../../../Layout/CTA.jsx'


const Home = () => {
    return (
        <div>
            <Hero/>
            <AboutFragrance/>
            <Perfumes/>
            <Difference/>
            <CTA/>
        </div>
    )
}

export default Home
