import './App.css';
import { BrowserRouter ,Route,Routes } from 'react-router-dom';
import RegistrationForm from './component/Register';
import LoginForm from './component/Login'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
