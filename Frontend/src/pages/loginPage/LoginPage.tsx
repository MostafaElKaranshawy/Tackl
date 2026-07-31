import { useState } from 'react';
import { login } from '../../services/authService';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await login(email, password);
    }
    return (
        <div className="login-page">
            <h1>Login Page</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit">Login</button>
            </form>
            <div className="reset-password-link">
                <a href="/reset-password">Forgot Password?</a>
            </div>
            <div className="confirm-email-link">
                <a href="/confirm-email">Didn't receive confirmation email?</a>
            </div>
        </div>
    );
}