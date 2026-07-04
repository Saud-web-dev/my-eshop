import React from 'react'
import Navbar from './Navbar.jsx'
import { Outlet } from 'react-router-dom'
import Footer from './Footer.jsx'

const Layout = () => {
  return (
    <div>

      <Navbar />


      <Outlet />


      <Footer />
      
    </div>
  )
}

export default Layout
