import { useState } from 'react';
import './signUpPage.css';
import { signUp } from '../../services/authService';

export default function SignUpPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await signUp(name, email, password);
    }
    return (
        <div className="sign-up-page">
            <h1>Sign Up Page</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        required
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

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

                <button type="submit">Sign Up</button>
            </form>
            <div className="to-login">
                <p>Already have an account? <a href="/login">Login here</a></p>
            </div>
        </div>
    );
}