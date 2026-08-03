import { Link } from "react-router-dom";
import { checkAuthentication } from "../../services/authService";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import ProjectBoard from "../../components/projectComponents/projectBoard/ProjectBoard";
import ProjectsSideBar from "../../components/projectComponents/ProjectsSideBar";
import TaskShow from "../../components/tasksComponents/TaskShowModal";
import { TaskRefreshProvider } from "../../contexts/TaskRefreshContext";

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
        <div className="home container min-h-screen min-w-screen flex flex-col items-start justify-start relative">
            <Header />
            <TaskRefreshProvider>
                <div className="main-section w-full flex flex-1 flex-row items-stretch p-2 gap-4">
                    <ProjectsSideBar />
                    <ProjectBoard />
                    <TaskShow />
                </div>
            </TaskRefreshProvider>
        </div>
    );
}