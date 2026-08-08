import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUpPage from './pages/signUpPage/SignUpPage'
import LoginPage from './pages/loginPage/LoginPage'
import GetPasswordLinkPage from './pages/resetPasswordPage/GetPasswordLinkPage'
import ResetPasswordPage from './pages/resetPasswordPage/ResetPasswordPage'
import EmailConfirmationPage from './pages/emailConfirmationPage/EmailConfirmationPage'
import GetEmailConfirmationLinkPage from './pages/emailConfirmationPage/GetEmailConfirmationLinkPage'
import HomePage from './pages/HomePage/HomePage'
import TaskPage from './pages/TaskPage'

import { RefreshProvider } from './contexts/RefreshContext/RefreshProvider'

function App() {
    return (
        <div className="app container w-screen h-screen bg-white min-h-screen flex flex-col items-center justify-center">
            <RefreshProvider>
                <Router>
                    <Routes>
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/reset-password" element={<GetPasswordLinkPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                        <Route path="/confirm-email" element={<GetEmailConfirmationLinkPage />} />
                        <Route path="/confirm-email/:token" element={<EmailConfirmationPage />} />
                        <Route path="/projects/:projectId?" element={<HomePage />} />
                        <Route path="/projects/:projectId/tasks/:taskId" element={<TaskPage />} />
                        <Route path="*" element={<Navigate to="/projects" replace />} />
                    </Routes>
                </Router>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    theme="light"
                />
            </RefreshProvider>
        </div>
    )
}

export default App
