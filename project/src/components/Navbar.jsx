import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Calculator, BarChart3, MessageCircle, FileText, Home } from 'lucide-react';
import { authService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/calculate', icon: Calculator, label: 'Calculate' },
    { path: '/analyze', icon: BarChart3, label: 'Analyze' },
    { path: '/chatbot', icon: MessageCircle, label: 'Chatbot' },
    { path: '/agent', icon: FileText, label: 'Agent Reports' },
  ];

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-white">
              Productix AI- Productivity Co Pilot
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-primary-500 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;