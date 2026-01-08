import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UploadPreview from './components/Uploadpreview';
import Dashboard from './components/Dashboard';
import CaseList from './components/Caselist';
import CaseEditor from './components/CaseEditor';
import Login from './components/Login';
import AdminUsers from './components/AdminUsers';
import PastVisits from './components/PastVisits';
import CreateCase from './components/CreateCase';
import Reports from './components/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

/**
 * App - now uses AuthProvider to drive immediate header updates on login/logout.
 */
function AppShell() {
  return (
    <div className="app-shell">
      <Header />

      <main className="main page-content" style={{ padding: '18px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Protected routes — require login */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPreview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedRoute>
                <CaseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/new"
            element={
              <ProtectedRoute>
                <CreateCase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:caseId"
            element={
              <ProtectedRoute>
                <CaseEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visits"
            element={
              <ProtectedRoute>
                <PastVisits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Admin-only route (requireAdmin) */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* Public login */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}