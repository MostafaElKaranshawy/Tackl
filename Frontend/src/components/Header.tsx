import { FaRegUserCircle } from "react-icons/fa";
import { IoSearchSharp } from "react-icons/io5";

export default function Header() {
    return (
        <header className="w-full p-2 pr-4 pl-4 h-full flex items-center justify-between gap-4">
            <p className="logo text-blue-500 text-4xl font-bold">Tackl</p>
            <div className="search-bar flex-1 max-w-[800px] relative">
                <IoSearchSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input type="text" placeholder="Search..." className="p-2 min-w-full rounded bg-white text-lg text-gray-700 pl-10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow shadow-blue-300" />
            </div>
            <div className="user-profile">
                <FaRegUserCircle className="text-blue-500 text-3xl bg-gray-200 rounded-full border-blue-800 cursor-pointer hover:bg-gray-300 transition ease duration-150" />
            </div>
        </header>
    );
}