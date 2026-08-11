import { useState } from "react";
import { getEmailConfirmationLink } from "../../services/authService";
import FormComponent from "../../components/generalPurposeComponents/FormComponent";
import FloatingInput from "../../components/generalPurposeComponents/FloatingInput";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function GetEmailConfirmationLinkPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await getEmailConfirmationLink(email);
            notify.success("Confirmation link has been sent if the email exists. Please check your inbox.");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    notify.error("Invalid input. Please check your email and try again.");
                } else if (error.response?.status === 409) {
                    if (error.response.data.message === "Email is already confirmed, login instead") {
                        notify.error("Email is already confirmed. Please log in.");
                    } else {
                        notify.error("Confirmation link was sent recently. Please check your email.");
                    }
                } else if (error.response?.status === 404) {
                    notify.error("Email not found. Please check your email and try again.");
                } else {
                    notify.error("An unexpected error occurred. Please try again.");
                }
            } else {
                notify.error("Error sending confirmation link. Please try again.");
            }
        }
    }

    return (
        <FormComponent
            title="Get Email Confirmation Link"
            subtitle="Enter your email to receive a confirmation link"
            submitText="Send Confirmation Link"
            onSubmit={handleSubmit}
            children={
                <FloatingInput
                    label="Email"
                    type="email"
                    value={email}
                    onChangeHandler={(e) => setEmail(e.target.value)}
                />
            }
        />
    );
}
