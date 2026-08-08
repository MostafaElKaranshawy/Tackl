import { useCallback, useEffect, useState } from "react";
import { getProjectById } from "../../services/projectService";
import type Project from "../../types/project";
import ProjectShow from "./ProjectShow";
import { notify } from "../../utils/notify";
import { useRefreshContext } from "../../contexts/RefreshContext/useRefreshContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function ProjectShowSection() {

    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const { setKey } = useRefreshContext();

    const returnToProjectsPage = useCallback(() => {
        setProject(null);
        navigate({
            pathname: "/projects",
            search: location.search,
        });
    }, [navigate]);

    useEffect(() => {
        if (!projectId || projectId === "undefined") {
            return;
        }

        let ignore = false;

        const fetchProjectDetails = async () => {
            try {
                const projectDetails = await getProjectById(projectId);

                if (!ignore) {
                    setProject(projectDetails);
                }
            } catch {
                if (!ignore) {
                    setProject(null);
                    notify.error(
                        "Project not found or has been deleted. Please select another project."
                    );
                    returnToProjectsPage();
                }
            }
        };

        fetchProjectDetails();

        return () => {
            ignore = true;
        };
    }, [projectId, navigate, returnToProjectsPage]);

    const handleProjectDelete = () => {
        returnToProjectsPage();
    }
    const handleProjectUpdate = (updatedProject: Project) => {
        setProject(updatedProject);
        setKey(prev => prev === null ? 1 : (prev + 1) % 2);
    };
    if (!project) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-lg text-gray-600">Select a project to view its details.</p>
            </div>
        );
    }

    return (
        <ProjectShow project={project} deleteRefresh={handleProjectDelete} onUpdated={handleProjectUpdate} />
    );
}