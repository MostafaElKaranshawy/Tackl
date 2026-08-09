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
            return;
        }

        const confirm = async () => {
            try {
                await confirmEmail(token);
                setSuccess(true);
                setMessage("Email confirmed successfully! You can now log in.");
            } catch{
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-10 text-center shadow-lg">
                <h1 className="mb-6 text-3xl font-bold font-mono">
                    Email Confirmation
                </h1>

                {loading ? (
                    <>
                        <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                        <p className="text-gray-600">
                            Confirming your email...
                        </p>
                    </>
                ) : (
                    <>
                        <p
                            className={`mb-2 text-lg font-medium ${success ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {message}
                        </p>

                        {success ? (
                            <Link
                                to="/login"
                                className="inline-block rounded-md bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600"
                            >
                                Go to Login
                            </Link>
                        ) : (
                            <Link
                                to="/"
                                className="inline-block rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-100"
                            >
                                Back to Sign Up
                            </Link>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}