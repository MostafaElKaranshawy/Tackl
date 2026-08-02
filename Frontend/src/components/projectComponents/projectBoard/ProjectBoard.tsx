import { useCurrentProjectContext } from "../../../contexts/CurrentProjectContext";
import { useEffect, useState } from "react";
import { getProjectById } from "../../../services/projectService";
import type Project from "../../../types/project";
import ProjectShow from "./ProjectShow";
import { notify } from "../../../utils/notify";

export default function ProjectBoard() {
    const { projectId, setProjectId } = useCurrentProjectContext();
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (projectId) {
                try {
                    const projectDetails = await getProjectById(projectId);
                    setProject(projectDetails);
                } catch (error) {
                    setProjectId(null);
                    setProject(null);
                    notify.error("Project not found or has been deleted. Please select another project.");
                }
            }
        };

        fetchProjectDetails();
    }, [projectId, setProjectId]);

    if (!project) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-lg text-gray-600">Select a project to view its details.</p>
            </div>
        );
    }

    return (
        <ProjectShow project={project} deleteRefresh={() => setProject(null)} />
    );
}