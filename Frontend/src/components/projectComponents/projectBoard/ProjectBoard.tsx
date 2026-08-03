import { useCurrentProjectContext } from "../../../contexts/CurrentProjectContext";
import { useEffect, useState } from "react";
import { getProjectById } from "../../../services/projectService";
import type Project from "../../../types/project";
import ProjectShow from "./ProjectShow";
import { notify } from "../../../utils/notify";
import { useRefreshContext } from "../../../contexts/RefreshContext";

export default function ProjectBoard() {
    const { projectId, setProjectId } = useCurrentProjectContext();
    const [project, setProject] = useState<Project | null>(null);
    const { setKey } = useRefreshContext();

    useEffect(() => {
        if (!projectId) {
            setProject(null);
            return;
        }

        let ignore = false;

        const fetchProjectDetails = async () => {
            try {
                const projectDetails = await getProjectById(projectId);

                if (!ignore) {
                    setProject(projectDetails);
                }
            } catch (error) {
                if (!ignore) {
                    setProjectId(null);
                    setProject(null);
                    notify.error(
                        "Project not found or has been deleted. Please select another project."
                    );
                }
            }
        };

        fetchProjectDetails();

        return () => {
            ignore = true;
        };
    }, [projectId]);

    const handleProjectUpdate = (updatedProject: Project) => {
        setProject(updatedProject);
        setKey(prev => prev === null ? 1 : (prev+1)%2);
    };
    if (!project) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-lg text-gray-600">Select a project to view its details.</p>
            </div>
        );
    }

    return (
        <ProjectShow project={project} deleteRefresh={() => setProject(null)} onUpdated={handleProjectUpdate} />
    );
}