import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const PatientListPage = lazy(() => import('./pages/PatientListPage'));
const PatientFormPage = lazy(() => import('./pages/PatientFormPage'));
const PatientEvolutionPage = lazy(() => import('./pages/PatientEvolutionPage'));
const ConsultationListPage = lazy(() => import('./pages/ConsultationListPage'));
const ConsultationFormPage = lazy(() => import('./pages/ConsultationFormPage'));
const EvolutionFormPage = lazy(() => import('./pages/EvolutionFormPage'));
const ConsultationSplitView = lazy(() => import('./pages/ConsultationSplitView'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const BackupPage = lazy(() => import('./pages/BackupPage'));

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
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
  );
}

export default App;
