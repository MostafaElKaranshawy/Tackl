import { useState } from "react";
import { getResetPasswordLink } from "../../services/authService";

export default function GetPasswordLinkPage() {

    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await getResetPasswordLink(email);
    }

    return (
        <div className="reset-password-page">
            <h1>Reset Password Page</h1>
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

                <button type="submit">Get Reset Password Link</button>
            </form>
        </div>
    );
}