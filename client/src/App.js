import './App.css';
import { BrowserRouter ,Route,Routes } from 'react-router-dom';
import RegistrationForm from './component/Register';
import LoginForm from './component/Login'
import { GoogleOAuthProvider } from '@react-oauth/google';
import Success from './EmailCompoent/GoogleSuccess';
import DashboardLayoutSlots from './adminComponent/dash';
import ForgotPassword from './EmailCompoent/ForgotPassword';
import ResetPassword from './EmailCompoent/ResetPassword';
import VerifyEmail from './EmailCompoent/VerifyEmail';
import Navbar from './component/Navbar';
import Footer from './component/Footer';

function App() {
  return (
    <GoogleOAuthProvider clientId="1084671829453-fa427391f1jfk5fmr07mv57eclobfhfc.apps.googleusercontent.com">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<DashboardLayoutSlots />} />
          <Route path="/oauth-success" element={<Success />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
