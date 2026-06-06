import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { ProductCreate } from './pages/ProductCreate';
import { CategoryCreate } from './pages/CategoryCreate';
import { UserManagement } from './pages/UserManagement';
import { VendorQuotations } from './pages/VendorQuotations';
import { SubmittedQuotations } from './pages/SubmittedQuotations';
import { CreateRFQ } from './pages/CreateRFQ';
import { RFQsList } from './pages/RFQsList';
import { VendorsList } from './pages/VendorsList';
import { BillsList } from './pages/BillsList';
import { PurchaseOrderDetail } from './pages/PurchaseOrderDetail';
import { PurchaseOrdersList } from './pages/PurchaseOrdersList';
import { BillView } from './pages/BillView';
import { SystemAudits } from './pages/SystemAudits';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Product & Category Routes (Protected) */}
          <Route path="/products" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Procurement Officer']}><Products /></ProtectedRoute>} />
          <Route path="/products/create" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Procurement Officer']}><ProductCreate /></ProtectedRoute>} />
          <Route path="/products/edit/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Procurement Officer']}><ProductCreate /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Procurement Officer']}><Categories /></ProtectedRoute>} />
          <Route path="/categories/create" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Procurement Officer']}><CategoryCreate /></ProtectedRoute>} />
          <Route path="/categories/edit/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Procurement Officer']}><CategoryCreate /></ProtectedRoute>} />

          {/* Role-Based Protected Dashboards */}
          <Route 
            path="/dashboard/:role" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/vendors" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Procurement Officer']}>
                <VendorsList />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/rfqs" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Procurement Officer']}>
                <RFQsList />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/rfqs/create" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Procurement Officer']}>
                <CreateRFQ />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/rfqs/edit/:id" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Procurement Officer']}>
                <CreateRFQ />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/vendor-quotations" 
            element={
              <ProtectedRoute>
                <VendorQuotations />
              </ProtectedRoute>
            } 
          />



          <Route 
            path="/submitted-quotations" 
            element={
              <ProtectedRoute>
                <SubmittedQuotations />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/purchase-orders/:id" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Procurement Officer']}>
                <PurchaseOrderDetail />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/purchase-orders" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Manager', 'Procurement Officer']}>
                <PurchaseOrdersList />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/bills" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Financer']}>
                <BillsList />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/bills/:id" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Financer', 'Manager', 'Procurement Officer']}>
                <BillView />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/system-audits" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <SystemAudits />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
