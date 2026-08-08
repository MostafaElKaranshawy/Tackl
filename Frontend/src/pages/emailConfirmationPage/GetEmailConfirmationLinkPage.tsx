import { useState } from "react";
import { getEmailConfirmationLink } from "../../services/authService";
import FormComponent from "../../components/generalPurposeComponents/FormComponent";
import FloatingInput from "../../components/generalPurposeComponents/FloatingInput";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";

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
        } catch {
            notify.error("Error sending confirmation link. Please try again.");
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
