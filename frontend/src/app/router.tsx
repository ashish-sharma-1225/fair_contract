import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '../components/layout/AppLayout';
import { LandingPage } from '../features/landing/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ContractsPage } from '../features/contracts/ContractsPage';
import { ContractDetailPage } from '../features/contracts/ContractDetailPage';
import { NewAnalysisWizardPage } from '../features/analysis/NewAnalysisWizardPage';
import { AnalysisResultsPage } from '../features/analysis/AnalysisResultsPage';
import { PoliciesPage } from '../features/policies/PoliciesPage';
import { RegulatoryRulesPage } from '../features/regulatory-rules/RegulatoryRulesPage';
import { HistoryPage } from '../features/history/HistoryPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { NotFoundPage } from '../features/not-found/NotFoundPage';

export const router = createBrowserRouter([
  // Public Landing and Auth Routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // Authenticated App Shell Routes
  {
    element: <AppLayout />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/contracts',
        element: <ContractsPage />,
      },
      {
        path: '/contracts/new',
        element: <NewAnalysisWizardPage />,
      },
      {
        path: '/contracts/:contractId',
        element: <ContractDetailPage />,
      },
      {
        path: '/analyses/:analysisId',
        element: <AnalysisResultsPage />,
      },
      {
        path: '/policies',
        element: <PoliciesPage />,
      },
      {
        path: '/regulatory-rules',
        element: <RegulatoryRulesPage />,
      },
      {
        path: '/history',
        element: <HistoryPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },

  // 404 Catch-all
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
