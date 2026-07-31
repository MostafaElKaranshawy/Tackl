import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { confirmEmail } from "../../services/authService";

export default function EmailConfirmationPage() {
    const { token } = useParams<{ token: string }>();

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("Confirming your email...");
    const [success, setSuccess] = useState(false);

    useEffect(() => {

        if (!token) {
            setMessage("Invalid or missing confirmation token.");
            setLoading(false);
            return;
        }

        const confirm = async () => {
            try {
                await confirmEmail(token);
                setSuccess(true);
                setMessage("Email confirmed successfully! You can now log in.");
            } catch (error) {
                console.error("Error confirming email:", error);
                setSuccess(false);
                setMessage(
                    "Failed to confirm your email. The link may be invalid or expired."
                );
            } finally {
                setLoading(false);
            }
        };

        confirm();
    }, [token]);

    return (
        <div className="email-confirmation-page">
            <h1>Email Confirmation</h1>

            {loading ? (
                <p>Confirming your email...</p>
            ) : (
                <>
                    <p>{message}</p>

                    {success && (
                        <Link to="/login">
                            Go to Login
                        </Link>
                    )}
                </>
            )}
        </div>
    );
}