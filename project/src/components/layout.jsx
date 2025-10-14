import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className="
          flex-1 p-6
          md:ml-64   /* Add left margin only on md+ screens when sidebar is visible */
        "
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
