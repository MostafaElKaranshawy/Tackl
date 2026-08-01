import { Link } from "react-router-dom";
import { checkAuthentication } from "../../services/authService";
import { useEffect, useState } from "react";

export default function HomePage() {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const verifyAuthentication = async () => {
            try {
                const authenticated = await checkAuthentication();
                setIsAuthenticated(authenticated);
            } finally {
                setLoading(false);
            }
        };

        verifyAuthentication();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
                <h1 className="text-4xl font-bold text-gray-800">Access Denied</h1>
                <p className="mt-4 text-lg text-gray-600">
                    You must be logged in to view this page.
                </p>
                <Link
                    to="/login"
                    className="mt-4 text-blue-500 hover:underline"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800">
                Welcome to Tackl
            </h1>
            <p className="mt-4 text-lg text-gray-600">
                Your one-stop solution for task management.
            </p>
        </div>
    );
}