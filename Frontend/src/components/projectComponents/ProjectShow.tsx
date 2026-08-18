import type Project from "../../types/project";
import { GoProjectRoadmap } from "react-icons/go";
import { MdAccessTime, MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdOutlineSort, MdUpdate } from "react-icons/md";
import { FaEdit, FaFilter } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import ManageProjectCard from "./ManageProjectCard";
import ConfirmationModal from "../generalPurposeComponents/ConfirmationModal";
import { deleteProject } from "../../services/projectService";
import ManageTaskCard from "../tasksComponents/ManageTaskCard";
import type Task from "../../types/task";
import { getProjectTasks } from "../../services/taskService";
import TasksList from "../tasksComponents/TasksList";
import SortByComponent from "./SortByComponent";
import { TASKS_PAGE_SIZE } from "../../constants";
import { CiBoxList } from "react-icons/ci";
import { MdViewKanban } from "react-icons/md";
import TaskBoard from "../tasksComponents/taskBoard/TaskBoard";
import { useNavigate } from "react-router-dom";
import { IoSearchSharp } from "react-icons/io5";
import ProjectsFilterMenu from "./ProjectsFilterMenu";
import { notify } from "../../utils/notify";

export default function ProjectShow(
    { project, deleteRefresh, onUpdated }: { project: Project, deleteRefresh?: () => void, onUpdated?: (project: Project) => void }) {
    const navigate = useNavigate();
    const PAGE_SIZE = TASKS_PAGE_SIZE;
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [taskList, setTaskList] = useState<Task[]>([]);
    const [sortOrder, setSortOrder] = useState("asc");
    const [sortBy, setSortBy] = useState("createdAt");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTasks, setTotalTasks] = useState(0);
    const [showSortOptions, setShowSortOptions] = useState(false);
    const attributesList = ["title", "dueDate", "priority", "createdAt", "updatedAt"];
    const sortRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const searchParams = new URLSearchParams(location.search);
    const currentSection = searchParams.get("section") === "board" ? "board" : "list";

    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filter, setFilter] = useState<{ status: string; priority: string; overdue: boolean | false }>({
        status: "",
        priority: "",
        overdue: false
    });
    const [search, setSearch] = useState("");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortOptions(false);
            }
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await getProjectTasks(project.id,
                {
                    page: currentSection === "list" ? currentPage : undefined,
                    pageSize: currentSection === "list" ? PAGE_SIZE : undefined,
                    sortBy,
                    sortOrder,
                    search,
                    ...filter
                });
            if (response.tasks && response.tasks.length === 0 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
            setTaskList(response.tasks);
            setTotalTasks(response.total);
        } catch {
            notify.error("Failed to fetch tasks. Please try again later.");
        }
    };

    useEffect(() => {
        let ignore = false;
        if (!project.id) {
            return;
        }
        const fetchData = async () => {
            try {
                const response = await getProjectTasks(project.id,
                    {
                        page: currentSection === "list" ? currentPage : undefined,
                        pageSize: currentSection === "list" ? PAGE_SIZE : undefined,
                        sortBy,
                        sortOrder,
                        search,
                        ...filter
                    });
                if (!ignore) {
                    console.log("Fetched tasks:", response.tasks);
                    setTaskList(response.tasks);
                    setTotalTasks(response.total);
                }
            } catch {
                if (!ignore) {
                    notify.error("Failed to fetch tasks. Please try again later.");
                }
            }
        };
        fetchData();
        return () => {
            ignore = true;
        };
    }, [currentPage, sortBy, sortOrder, filter, project.id, search, PAGE_SIZE, currentSection]);


    const handleDeleteProject = async (id: string) => {
        try {
            await deleteProject(id);
            if (deleteRefresh) deleteRefresh();
        } catch {
            notify.error("Failed to delete project. Please try again later.");
        }
    }
    return (
        <section className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
            <div className="mb-2 flex items-center gap-3 border-b border-gray-200 pb-5">
                <div className="rounded-lg bg-blue-100 p-3 flex items-center justify-center">
                    <GoProjectRoadmap className="text-3xl text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {project.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Project Information
                    </p>
                </div>
                <div className="project-tools flex items-center gap-3 ml-auto text-2xl text-blue-500">
                    <FaEdit
                        className="text-gray-500 cursor-pointer hover:text-blue-700 transition ease duration-150"
                        onClick={() => {
                            setShowEditModal(true);
                        }}
                    />
                    <MdDeleteForever
                        className="text-gray-500 cursor-pointer hover:text-red-700 transition ease duration-150"
                        onClick={() => setShowDeleteConfirmation(true)}
                    />

                </div>
            </div>

            <div className="space-y-8 mb-4">
                <div>
                    <h2 className="mb-2 text-lg font-semibold uppercase tracking-wide text-gray-500">
                        Description
                    </h2>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <p className="leading-7 text-gray-700">
                            {project.description ? project.description : (
                                <span className="italic text-gray-400">
                                    No description provided.
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <MdAccessTime className="text-2xl text-green-600" />

                        <div>
                            <p className="text-xs uppercase text-gray-500">
                                Created
                            </p>
                            <p className="font-medium text-gray-800">
                                {new Date(project.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <MdUpdate className="text-2xl text-blue-600" />

                        <div>
                            <p className="text-xs uppercase text-gray-500">
                                Last Updated
                            </p>
                            <p className="font-medium text-gray-800">
                                {new Date(project.updatedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-500">
                        Tasks
                    </h2>
                    <div className="flex rounded-lg border border-gray-300 bg-gray-100 p-1 ">
                        <button
                            onClick={() => {
                                const searchParams = new URLSearchParams(location.search);

                                searchParams.set("section", "list");

                                navigate({
                                    pathname: `/projects/${project.id}`,
                                    search: `?${searchParams.toString()}`,
                                });
                            }}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition cursor-pointer
                                    ${currentSection === "list"
                                    ? "bg-white text-blue-600 shadow"
                                    : "text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <CiBoxList className="text-lg" />
                            List
                        </button>

                        <button
                            onClick={() => {
                                const searchParams = new URLSearchParams(location.search);

                                searchParams.set("section", "board");

                                navigate({
                                    pathname: `/projects/${project.id}`,
                                    search: `?${searchParams.toString()}`,
                                });
                            }}
                            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition cursor-pointer
                                    ${currentSection === "board"
                                    ? "bg-white text-blue-600 shadow"
                                    : "text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            <MdViewKanban className="text-lg" />
                            Board
                        </button>
                    </div>
                    <div className="search-bar flex-1 max-w-[400px] relative">
                        <IoSearchSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="p-2 min-w-full rounded bg-white text-lg text-gray-700 pl-10 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow shadow-blue-300"
                            onChange={(e) => {
                                const searchTerm = e.target.value.toLowerCase();
                                setSearch(searchTerm);
                            }}
                        />
                        <FaFilter
                            className={
                                "absolute right-3 top-1/2 transform -translate-y-1/2 text-lg cursor-pointer hover:text-blue-500 transition ease duration-150"
                                + (filter.status !== "" || filter.priority !== "" || filter.overdue === true ? " text-blue-500" : "text-gray-400")
                            }
                            onClick={() => {
                                setShowFilterMenu((prev) => !prev);
                            }}
                        />
                        <div ref={filterRef} className="absolute right-0 top-full z-10 mt-2">
                            {
                                showFilterMenu && (
                                    <ProjectsFilterMenu
                                        filter={filter}
                                        setFilter={setFilter}
                                        onConfirm={() => {
                                            setShowFilterMenu(false);
                                        }}
                                    />
                                )
                            }
                        </div>
                    </div>
                    <div className="sort-section relative" ref={sortRef}>
                        <MdOutlineSort
                            className="text-blue-500 text-2xl cursor-pointer hover:text-blue-700 transition ease duration-150"
                            onClick={() => {
                                setShowSortOptions((prev) => !prev);
                            }}
                        />
                        {
                            showSortOptions && (
                                <SortByComponent
                                    attributesList={attributesList}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                />
                            )
                        }
                    </div>
                    <button
                        className="rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white cursor-pointer hover:bg-blue-600 transition ease duration-150"
                        onClick={() => {
                            setShowAddTaskModal(true);
                        }}
                    >
                        + Add Task
                    </button>
                    {
                        showAddTaskModal && (
                            <ManageTaskCard
                                mode="create"
                                projectId={project.id}
                                onSuccess={async () => {
                                    setShowAddTaskModal(false);
                                    await fetchTasks();
                                }}
                                onClose={() => setShowAddTaskModal(false)}
                            />
                        )
                    }
                </div>
                <div className="pagination flex items-center justify-end gap-3 ">
                    {
                        currentSection === "list" && (

                            <div className="tools flex items-center gap-3 text-gray-500 self-end">
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
                                <div className="tasks-count">
                                    <span className="text-sm text-gray-500">
                                        {totalTasks === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, totalTasks)} of {totalTasks}
                                    </span>
                                </div>
                                <MdOutlineKeyboardArrowRight
                                    onClick={() => {
                                        if (currentPage < Math.ceil(totalTasks / PAGE_SIZE)) {
                                            setCurrentPage((p) => p + 1);
                                        }
                                    }}
                                    className={`text-2xl transition duration-150 ${currentPage * PAGE_SIZE < totalTasks
                                        ? "text-blue-500 cursor-pointer hover:text-blue-700"
                                        : "text-gray-400 cursor-not-allowed"
                                        }`}
                                />
                            </div>
                        )
                    }
                </div>
                {
                    currentSection === "list" ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8">
                            {
                                taskList.length > 0 ? (
                                    <TasksList tasks={taskList} refresh={fetchTasks} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <p className="text-lg font-medium text-gray-600">
                                            No tasks yet
                                        </p>

                                        <p className="mt-2 max-w-md text-sm text-gray-500">
                                            Tasks for this project will appear here. You'll be able to
                                            create, assign, prioritize, and track progress.
                                        </p>
                                    </div>
                                )
                            }
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                            <TaskBoard projectId={project.id} tasks={taskList} fetchTasks={fetchTasks} />
                        </div>
                    )
                }
            </div>
            {
                showEditModal && (
                    <ManageProjectCard
                        mode="edit"
                        project={project}
                        onSuccess={(project: Project | undefined) => {
                            setShowEditModal(false);
                            navigate({ pathname: `/projects/${project?.id}`, search: location.search });

                            if (project && onUpdated) {
                                onUpdated(project);
                            }
                            fetchTasks();
                        }}
                        onClose={() => setShowEditModal(false)}
                    />
                )
            }
            {
                showDeleteConfirmation && (
                    <ConfirmationModal
                        title="Delete Project"
                        message={`Are you sure you want to delete the project "${project.name}"? This action cannot be undone and will delete all subsequent created tasks!`}
                        onConfirm={() => {
                            handleDeleteProject(project.id);
                            setShowDeleteConfirmation(false);
                        }}
                        onCancel={() => setShowDeleteConfirmation(false)}
                        danger={true}
                    />
                )
            }

        </section>
    );
}