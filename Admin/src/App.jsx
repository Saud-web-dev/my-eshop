import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './assets/Auth/Signup'
import Login from './assets/Auth/Login'
import Sidebar from './assets/components/Sidebar'
import Dashboard from './assets/pages/Dashboard'

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />


        <Route element={<Sidebar/>}>

          <Route path="/dashboard" element={<Dashboard />} />

        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App
