import { useState } from "react";
import { resetPassword } from "../../services/authService";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetPasswordPage() {
    const { token } = useParams<{ token: string }>();
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if(!token) {
            alert("Wait a while, something went wrong. Please try again.");
            return;
        }
        try {
            console.log(password, token);
            const response = await resetPassword(password, token);
            console.log("Password reset response:", response);
            alert("Password reset successful, you can now log in with your new password.");
            const navigate = useNavigate();
            navigate("/login");
        } catch (error) {
            alert(error);
        }
        
    }
    return (
        <div className="reset-password-page">
            <h1>Reset Password Page</h1>
            <form onSubmit={handleSubmit}>
                <div className="new-password-group">
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="confirm-password-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Reset Password</button>
            </form>
        </div>
    );
}