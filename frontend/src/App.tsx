import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Atlas from "./pages/Atlas";
import Analyze from "./pages/Analyze";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Regions from "./pages/Regions";
import RegionDetails from "./pages/RegionDetails";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
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
          path="/atlas"
          element={
            <ProtectedRoute>
              <Layout>
                <Atlas />
              </Layout>
            </ProtectedRoute>
          }
        />

          <Route
          path="/infrastructure"
          element={
            <ProtectedRoute>
              <Layout>
                <RegionDetails />
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
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/regions"
          element={
            <ProtectedRoute>
              <Layout>
                <Regions />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;