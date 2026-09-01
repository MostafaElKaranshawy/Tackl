import { useState } from "react";
import { getResetPasswordLink } from "../../services/authService";
import FormComponent from "../../components/generalPurposeComponents/FormComponent";
import FloatingInput from "../../components/generalPurposeComponents/FloatingInput";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function GetPasswordLinkPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await getResetPasswordLink(email);
            notify.success("Password reset link sent! Please check your email.");
            navigate("/login");
        } catch (error) {
            if (axios.isAxiosError(error) && error.status == 409) {
                notify.warning("An email was sent recently, please check your inbox or try again later.");
                return;
            }
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