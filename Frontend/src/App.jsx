import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./assets/Layout/Layout.jsx";
import Home from "./assets/Pages/Home/Page/Home";
import About from "./assets/Pages/About/Page/About";
import ScrollToTop from "./assets/commen/Components/ScrollToTop.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;