import { useCallback, useEffect, useState } from "react";
import { getTaskById } from "../services/taskService";
import { useParams } from "react-router-dom";
import type Task from "../types/task";

export default function TaskPage() {
    const { projectId, taskId } = useParams<{
        projectId: string;
        taskId: string;
    }>();

    const [task, setTask] = useState<Task | null>(null);

    const fetchTask = useCallback(async () => {
        if (!taskId || !projectId) return;

        try {
            const data = await getTaskById(taskId, projectId);
            setTask(data);
        } catch (error) {
            console.error("Failed to fetch task.", error);
        }
    }, [projectId, taskId]);

    useEffect(() => {
        fetchTask();
    }, [fetchTask]);

    if (!task) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white rounded-xl shadow-lg px-8 py-6">
                    <p className="text-lg text-gray-600">
                        Task not found.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen min-w-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="border-b px-8 py-6">
                        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-blue-100 text-blue-700">
                            Task
                        </span>

                        <h1 className="mt-3 text-3xl font-bold text-gray-900">
                            {task.title}
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3">
                        <div className="lg:col-span-2 p-8 border-r">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Description
                            </h2>

                            <div className="rounded-lg border bg-gray-50 p-5 min-h-52">
                                {task.description ? (
                                    <p className="text-gray-700 whitespace-pre-wrap leading-7">
                                        {task.description}
                                    </p>
                                ) : (
                                    <p className="italic text-gray-400">
                                        No description provided.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Details
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Project ID
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {projectId}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Task ID
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {task.id}
                                    </p>
                                </div>

                                {task.createdAt && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Created
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(task.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                {task.updatedAt && (
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Last Updated
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(task.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}