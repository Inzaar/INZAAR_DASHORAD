import React from 'react';

const Card = ({ children, className }) => {
  return (
    <div className={`bg-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export default Card;