import './App.css';
import { BrowserRouter ,Route,Routes } from 'react-router-dom';
import RegistrationForm from './component/Register';
import LoginForm from './component/Login'
import { GoogleOAuthProvider } from '@react-oauth/google';
import Success from './component/GoogleSuccess';
import DashboardLayoutSlots from './component/dash';
import ForgotPassword from './component/ForgotPassword';
import ResetPassword from './component/ResetPassword';
import VerifyEmail from './component/VerifyEmail';

function App() {
  return (
    <GoogleOAuthProvider clientId="1084671829453-fa427391f1jfk5fmr07mv57eclobfhfc.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<DashboardLayoutSlots />} />

      <Route path="/success" element={<Success />} />

  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  <Route path="/verify-email" element={<VerifyEmail />} />


          {/* يمكنك إضافة المزيد من المسارات هنا */}
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
