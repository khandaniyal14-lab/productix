import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout'; // New Layout with Sidebar

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Calculate from './pages/Calculate';
import Analyze from './pages/Analyze';
import Chatbot from './pages/Chatbot';
import Agent from './pages/Agent';
import Verify_Result from './pages/verify_result';
import SuperAdmin from './pages/system_admin';
import OrgDashboard from './pages/org_admin'

//Productivity Module Pages (to integrate later)
import Products from './pages/productivity/Products';
import Batches from './pages/productivity/batches';
import ShiftEntry from './pages/productivity/ShiftEntry';
import Reports from './pages/productivity/Reports';
import AIAnalysis from './pages/productivity/AIAnalysis';
import RAGChat from './pages/productivity/RAGChat';
import ExcelUpload from "./pages/productivity/upload";


// Wrapper for public routes
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          <Route
            path="/org_admin"
            element={
              <ProtectedRoute allowedRoles={['org_admin']}>
                <Layout>
                  <OrgDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Email Verification Result Page */}
          <Route path="/verify-result" element={<Verify_Result />} />

          {/* Protected Routes with Sidebar Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calculate"
            element={
              <ProtectedRoute>
                <Layout>
                  <Calculate />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productivity/excel-upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <ExcelUpload />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <Layout>
                  <Analyze />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Layout>
                  <Chatbot />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent"
            element={
              <ProtectedRoute>
                <Layout>
                  <Agent />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Productivity Module Pages (Add page by page) */}
          <Route
            path="/productivity/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productivity/batches"
            element={
              <ProtectedRoute>
                <Layout>
                  <Batches />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productivity/shift-entry"
            element={
              <ProtectedRoute>
                <Layout>
                  <ShiftEntry />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productivity/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productivity/ai"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIAnalysis />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productivity/rag-chat"
            element={
              <ProtectedRoute>
                <Layout>
                  <RAGChat />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/system_admin"
            element={
              <ProtectedRoute>

                <SuperAdmin />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

