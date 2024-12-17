import React, { useState } from "react";
import ImageFilter from "../Filter/ImageFilter";
import Hero from "./Hero";
import About from './About';
import Services from './Services'
import PlacesToGo from './PlacesToGo'
const HomePage = () => {
  return (
    <div className="w-full min-h-screen">
      <Hero />
      <About />
      <PlacesToGo />
      <Services/>
    </div>
  );
};

export default HomePage;
