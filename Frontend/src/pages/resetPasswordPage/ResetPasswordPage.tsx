import { useState } from "react";
import { resetPassword } from "../../services/authService";
import { useParams } from "react-router-dom";
import FormComponent from "../../components/FormComponent";
import FloatingInput from "../../components/FloatingInput";
import { notify } from "../../utils/notify";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function ResetPasswordPage() {
    const { token } = useParams<{ token: string }>();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            notify.error("Passwords do not match. Please try again.");
            return;
        }
        if (!token) {
            notify.error("Invalid or timed out reset link. Please check your reset link. If the issue persists, request a new password reset link.");
            return;
        }
        try {
            await resetPassword(password, token);
            setPassword("");
            setConfirmPassword("");
            notify.success("Password reset successful! You can now log in with your new password.");
            setTimeout(() => {
                window.location.href = "/login";
            }, 3000);
        } catch (error) {
            notify.error("Failed to reset password. Please try again.");
        }

    }
    return (
        <FormComponent
            title="Reset Password"
            subtitle="Enter your new password below"
            submitText="Reset Password"
            onSubmit={handleSubmit}
            children={
                <>  
                    <div className="password-container relative">
                        <FloatingInput
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChangeHandler={(e) => setPassword(e.target.value)}
                        />
                        <span
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="password-container relative">
                        <FloatingInput
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChangeHandler={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </>
            }
        />
    );
}