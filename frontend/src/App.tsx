import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { NewProject } from './pages/NewProject';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RoleManagement } from './pages/RoleManagement';
import { MyTasks } from './pages/MyTasks';
import { PricingWorkflow } from './pages/PricingWorkflow';
import { LogisticsWorkflow } from './pages/LogisticsWorkflow';
import { Notifications } from './pages/Notifications';
import { Tasks } from './pages/Tasks';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/my-tasks" element={<MyTasks />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/new" element={<NewProject />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/projects/:id/pricing" element={<PricingWorkflow />} />
                    <Route path="/projects/:id/freight" element={<LogisticsWorkflow />} />
                    <Route
                      path="/role-management"
                      element={
                        <ProtectedRoute requiredPermission="MANAGE_PERMISSIONS">
                          <RoleManagement />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
