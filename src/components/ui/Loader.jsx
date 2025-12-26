import React from 'react';
import logo from '../../assets/icons/logo.png';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center animate-pulse">
        <img 
          src={logo} 
          alt="Inzaar Dashorad Logo" 
          className="w-24 h-24 md:w-32 md:h-32 object-contain mb-4"
        />
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;
