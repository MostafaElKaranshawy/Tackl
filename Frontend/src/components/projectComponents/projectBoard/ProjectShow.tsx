import type Project from "../../../types/project";
import { GoProjectRoadmap } from "react-icons/go";
import { MdAccessTime, MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdOutlineSort, MdUpdate } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import ManageProjectCard from "../ManageProjectCard";
import ConfirmationModal from "../../ConfirmationModal";
import { deleteProject } from "../../../services/projectService";
import { useCurrentProjectContext } from "../../../contexts/CurrentProjectContext";
import ManageTaskCard from "../../tasksComponents/ManageTaskCard";
import type Task from "../../../types/task";
import { getAllProjectTasks, getProjectTasks } from "../../../services/taskService";
import TasksList from "../../tasksComponents/TasksList";
import SortByComponent from "../SortByComponent";
import { TASKS_PAGE_SIZE } from "../../../constants";
import { CiBoxList } from "react-icons/ci";
import { MdViewKanban } from "react-icons/md";
import TaskBoard from "../../tasksComponents/taskBoard/TaskBoard";

export default function ProjectShow(
    { project, deleteRefresh, onUpdated }: { project: Project, deleteRefresh?: () => void, onUpdated?: (project: Project) => void }) {
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
    const { setProjectId } = useCurrentProjectContext();
    const sortRef = useRef<HTMLDivElement>(null);
    const [currentSection, setCurrentSection] = useState<"list" | "board">("list");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (currentSection !== "list") return

        fetchTasks();
    }, [currentPage, sortBy, sortOrder, project.id]);

    const fetchTasks = async () => {
        try {
            if (currentSection === "list") {
                const response = await getProjectTasks(project.id, { page: currentPage, pageSize: PAGE_SIZE, sortBy, sortOrder });
                setTaskList(response.tasks);
                setTotalTasks(response.total);
            } else {
                const response = await getAllProjectTasks(project.id);
                setTaskList(response);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await deleteProject(id);
            setProjectId(null);
            deleteRefresh && deleteRefresh();
        } catch (error) {
            alert("Failed to delete project. Please try again later.");
        }
    }
    return (
        <section className="flex-1 rounded-xl border border-gray-200 bg-white p-8 shadow-md">
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

            <div className="space-y-8 mb-2">
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

            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-500">
                        Tasks
                    </h2>
                    <div className="flex rounded-lg border border-gray-300 bg-gray-100 p-1 ">
                        <button
                            onClick={() => setCurrentSection("list")}
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
                            onClick={() => setCurrentSection("board")}
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
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8">
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
                            setProjectId(project?.id || null);

                            if (project && onUpdated) {
                                onUpdated(project);
                            }
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