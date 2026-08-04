import { useEffect, useRef, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";
import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";

export default function Header() {
    const [showLogout, setShowLogout] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const navigate = useNavigate();
    const logOutRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (logOutRef.current && !logOutRef.current.contains(event.target as Node)) {
                setShowLogout(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [logOutRef]);

    return (
        <header className="w-full max-h-[70px] p-2 pr-4 pl-4 h-full flex items-center justify-between gap-4 relative">
            <p className="logo text-blue-500 text-4xl font-bold">Tackl</p>
            <div className="search-bar flex-1 max-w-[800px] relative">
                <IoSearchSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input type="text" placeholder="Search..." className="p-2 min-w-full rounded bg-white text-lg text-gray-700 pl-10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow shadow-blue-300" />
            </div>
            <div className="user-profile" onClick={() => setShowLogout((prev) => !prev)}>
                <FaRegUserCircle className="text-blue-500 text-3xl bg-gray-200 rounded-full border-blue-800 cursor-pointer hover:bg-gray-300 transition ease duration-150" />
            </div>

            {
                showLogout && (
                    <div
                        className="absolute top-[100%] w-48 right-4 bg-white border border-gray-300 rounded shadow-md p-2 text-red-500 hover:text-red-700 hover:bg-red-100 transition ease duration-150 cursor-pointer"
                        ref={logOutRef}
                        onClick={() => setShowConfirmationModal(true)}>
                        <button
                            className="cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>
                )
            }
            {
                showConfirmationModal && (
                    <ConfirmationModal
                        message="Are you sure you want to logout?"
                        onConfirm={async () => {
                            await logout();
                            setShowConfirmationModal(false);
                            setShowLogout(false);
                            navigate("/login");
                        }}
                        confirmText="Logout"
                        cancelText="Stay here"
                        danger={true}
                        onCancel={() => setShowConfirmationModal(false)}
                    />
                )
            }
        </header>
    );
}