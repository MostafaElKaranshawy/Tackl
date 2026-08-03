import ProjectCard from "./ProjectCard";
import { MdOutlineSort, MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { GoProjectRoadmap } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { getProjects } from "../../services/projectService";
import axios from "axios";
import { notify } from "../../utils/notify";
import type Project from "../../types/project";
import SortByComponent from "./SortByComponent";
import CreateProjectCard from "./ManageProjectCard";
import { IoReload } from "react-icons/io5";
import { useRefreshContext } from "../../contexts/RefreshContext";
import { PROJECTS_PAGE_SIZE } from "../../constants";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function ProjectsSideBar() {
    const PAGE_SIZE = PROJECTS_PAGE_SIZE;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sortMenuRef = useRef<HTMLDivElement>(null);
    const { projectId } = useParams<{ projectId: string }>();
    const { key } = useRefreshContext();
    const [projects, setProjects] = useState<Project[]>([]);
    const [sortOrder, setSortOrder] = useState("asc");
    const [sortBy, setSortBy] = useState("createdAt");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);
    const [showSortOptions, setShowSortOptions] = useState(false);
    const attributesList = ["name", "createdAt", "updatedAt"];
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    useEffect(() => {
        const currentSortBy = searchParams.get("sortBy");
        const currentSortOrder = searchParams.get("sortOrder");
        if (currentSortBy && attributesList.includes(currentSortBy)) {
            setSortBy(currentSortBy);
        }
        if (currentSortOrder && ["asc", "desc"].includes(currentSortOrder)) {
            setSortOrder(currentSortOrder);
        }
    }, [])
    useEffect(() => {
        navigate(
            `/projects/${projectId}?sortBy=${sortBy}&sortOrder=${sortOrder}`
        );
        fetchProjects();
    }, [sortOrder, sortBy, currentPage, key]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setShowSortOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [sortMenuRef]);

    useEffect(() => {
        if (projectId) return;

        fetchProjects();
    }, [projectId]);

    const fetchProjects = async () => {
        try {
            const data = await getProjects({
                page: currentPage,
                pageSize: PAGE_SIZE,
                sortBy,
                sortOrder
            });
            setProjects(data.projects || []);
            setTotalProjects(data.total || 0);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    notify.error("You are not authorized to view the projects. Please log in.");
                } else {
                    notify.error("Failed to fetch projects. Please try again later.");
                }
            } else {
                notify.error("An unexpected error occurred. Please try again later.");
            }
        }
    };

    return (
        <section className="projects-section bg-[linear-gradient(to_top,_#d9e8fd,_#ebf3fe)] rounded-lg min-w-[300px] max-w-[400px] flex-shrink-0 shadow-md shadow-blue-200 border border-gray-300">
            <div className="nav-bar-header text-blue-500 text-2xl p-2 pt-4 pb-4 flex items-center justify-between rounded-t-lg border-b border-gray-300">
                <div className="nav-bar-title-text flex items-center gap-2">
                    <GoProjectRoadmap />
                    <p className="text-xl font-bold font-mono text-blue-800 text-bold">Projects</p>
                </div>
                <div ref={sortMenuRef} className="tools-button flex justify-center items-center gap-2 relative">
                    <IoReload
                        className="text-blue-500 text-2xl cursor-pointer hover:text-blue-700 transition ease duration-150"
                        onClick={fetchProjects}
                    />
                    <IoMdAdd
                        className="text-blue-500 text-2xl cursor-pointer hover:text-blue-700 transition ease duration-150"
                        onClick={() => setShowCreateProjectModal(true)}
                    />
                    <MdOutlineSort
                        className="text-blue-500 text-2xl cursor-pointer hover:text-blue-700 transition ease duration-150"
                        onClick={() => {
                            setShowSortOptions((prev) => !prev);
                        }}
                    />
                    {showSortOptions && (
                        <SortByComponent

                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            sortOrder={sortOrder}
                            setSortOrder={setSortOrder}
                            attributesList={attributesList}
                        />
                    )}
                </div>
            </div>
            <div className="pagination flex justify-between items-center p-2 rounded-b-lg">
                <div className="total-projects">
                    {totalProjects === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, totalProjects)} of {totalProjects}
                </div>
                <div className="move-page flex justify-center items-center gap-2 p-2">
                    <MdOutlineKeyboardArrowLeft
                        onClick={() => {
                            if (currentPage > 1) {
                                setCurrentPage((p) => p - 1);
                            }
                        }}
                        className={`text-2xl transition duration-150 ${currentPage > 1
                            ? "text-blue-500 cursor-pointer hover:text-blue-700"
                            : "text-gray-400 cursor-not-allowed"
                            }`}
                    />

                    <MdOutlineKeyboardArrowRight
                        onClick={() => {
                            if (currentPage < Math.ceil(totalProjects / PAGE_SIZE)) {
                                setCurrentPage((p) => p + 1);
                            }
                        }}
                        className={`text-2xl transition duration-150 ${currentPage * PAGE_SIZE < totalProjects
                            ? "text-blue-500 cursor-pointer hover:text-blue-700"
                            : "text-gray-400 cursor-not-allowed"
                            }`}
                    />
                </div>
            </div>
            <div className="projects-list p-4 flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-none">
                {projects && projects.length > 0 && projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
            {
                showCreateProjectModal && (
                    <CreateProjectCard
                        mode="create"
                        onSuccess={async () => {
                            setShowCreateProjectModal(false);
                            await fetchProjects();
                        }}
                        onClose={() => setShowCreateProjectModal(false)}
                    />
                )
            }
        </section>
    );
}