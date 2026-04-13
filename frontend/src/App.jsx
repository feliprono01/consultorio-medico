import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const PatientListPage = lazy(() => import('./pages/patient/PatientListPage'));
const PatientFormPage = lazy(() => import('./pages/patient/PatientFormPage'));
const PatientEvolutionPage = lazy(() => import('./pages/patient/PatientEvolutionPage'));
const ConsultationListPage = lazy(() => import('./pages/consultation/ConsultationListPage'));
const ConsultationFormPage = lazy(() => import('./pages/consultation/ConsultationFormPage'));
const EvolutionFormPage = lazy(() => import('./pages/consultation/EvolutionFormPage'));
const ConsultationSplitView = lazy(() => import('./pages/consultation/ConsultationSplitView'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const BackupPage = lazy(() => import('./pages/admin/BackupPage'));

import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/pacientes" element={<PatientListPage />} />
              <Route path="/pacientes/new" element={<PatientFormPage />} />
              <Route path="/pacientes/edit/:id" element={<PatientFormPage />} />
              <Route path="/pacientes/evolucion/:id" element={<PatientEvolutionPage />} />
              <Route path="/consultas" element={<ConsultationListPage />} />
              <Route path="/consultas/new" element={<ConsultationSplitView />} />
              <Route path="/consultas/evolucion" element={<EvolutionFormPage />} />
              <Route path="/consultas/edit/:id" element={<ConsultationSplitView />} />
              <Route path="/usuarios" element={<UserManagementPage />} />
              <Route path="/backups" element={<BackupPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
