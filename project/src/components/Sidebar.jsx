import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { authService } from "../services/api";

import { Home, Calculator, BarChart3, MessageCircle, Users, FileText, LogOut, Menu, X, } from "lucide-react";
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(authService.getRole()); // Get role from localStorage
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/";
  };
  const adminNav = [
    { path: "/org_admin", icon: Users, label: "Admin Panel" },
  ];
  // Common links for all users
  const commonNav = [
    
    { path: "/calculate", icon: Calculator, label: "General Productivity Calculator" },
  
    { path: "/dashboard", icon: Home, label: "Dashboard" },
   
    
    // Productivity module
    { path: "/productivity/products", icon: FileText, label: "Products" },
    { path: "/productivity/excel-upload", icon: FileText, label: "Excel Upload" },
    { path: "/productivity/batches", icon: FileText, label: "Batches" },
    { path: "/productivity/shift-entry", icon: FileText, label: "Shift Entry" },
    { path: "/productivity/reports", icon: BarChart3, label: "Batch Reports" },
    { path: "/productivity/ai", icon: BarChart3, label: "AI Batch Analyzer" },
    { path: "/agent", icon: FileText, label: "AI-Reports Agent" },
     { path: "/chatbot", icon: MessageCircle, label: "Chatbot" },
  ];

  // Org admin link


  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-purple-600 text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 p-4 flex flex-col justify-between transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:w-64`}
      >
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Productix AI</h2>
          <nav className="flex flex-col gap-2">


            {/* Admin Panel button - only for org_admin */}
            {role === "org_admin" &&
              adminNav.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? "bg-purple-600 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}

            {commonNav.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "bg-purple-600 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;
