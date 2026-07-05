import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './assets/Auth/Signup'
import Login from './assets/Auth/Login'
import Sidebar from './assets/components/Sidebar'
import Dashboard from './assets/pages/Dashboard'
import Products from './assets/pages/Products'
import ProductForm from './assets/pages/ProductForm'
import Categories from './assets/pages/Categories'
import ProductDetails from './assets/pages/ProductDetails'


const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />


        <Route element={<Sidebar />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/categories" element={<Categories />} />

        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App
