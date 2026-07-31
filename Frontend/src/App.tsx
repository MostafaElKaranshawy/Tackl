import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import SignUpPage from './pages/signUpPage/SignUpPage'
import LoginPage from './pages/loginPage/LoginPage'
import GetPasswordLinkPage from './pages/resetPasswordPage/GetPasswordLinkPage'
import ResetPasswordPage from './pages/resetPasswordPage/ResetPasswordPage'
import EmailConfirmationPage from './pages/emailConfirmationPage/EmailConfirmationPage'
import GetEmailConfirmationLinkPage from './pages/emailConfirmationPage/GetEmailConfirmationLinkPage'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<GetPasswordLinkPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> 
          <Route path="/confirm-email" element={<GetEmailConfirmationLinkPage />} />
          <Route path="/confirm-email/:token" element={<EmailConfirmationPage />} />

        </Routes>
      </Router>
    </>
  )
}

export default App
