import './App.css';
import { BrowserRouter ,Route,Routes } from 'react-router-dom';
import RegistrationForm from './component/Register';
import LoginForm from './component/Login'
import { GoogleOAuthProvider } from '@react-oauth/google';
import Success from './component/GoogleSuccess';


function App() {
  return (
    <GoogleOAuthProvider clientId="1084671829453-fa427391f1jfk5fmr07mv57eclobfhfc.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
      <Route path="/success" element={<Success />} />
          {/* يمكنك إضافة المزيد من المسارات هنا */}
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
