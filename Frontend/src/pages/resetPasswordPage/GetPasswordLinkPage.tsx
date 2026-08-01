import { useState } from "react";
import { getResetPasswordLink } from "../../services/authService";
import FormComponent from "../../components/FormComponent";
import FloatingInput from "../../components/FloatingInput";
import { notify } from "../../utils/notify";

export default function GetPasswordLinkPage() {

    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await getResetPasswordLink(email);
            notify.success("Password reset link sent! Please check your email.");
            window.location.href = '/login';
        } catch (error) {
            notify.error("Failed to send password reset link. Please try again.");
        }
    }

    return (
        <div className="reset-password-page">
            <FormComponent
                title="Reset Password"
                subtitle="Enter your email to receive a password reset link."
                submitText="Get Reset Link"
                onSubmit={handleSubmit}
            >
                <FloatingInput
                    label="Email"
                    type="email"
                    value={email}
                    onChangeHandler={(e) => setEmail(e.target.value)}
                />
            </FormComponent>
        </div>
    );
}