import { useEffect, useState } from "react";
import { getProjectById } from "../../../services/projectService";
import type Project from "../../../types/project";
import ProjectShow from "./ProjectShow";
import { notify } from "../../../utils/notify";
import { useRefreshContext } from "../../../contexts/RefreshContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function ProjectBoard() {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const { setKey } = useRefreshContext();

    useEffect(() => {
        if (!projectId) {
            navigate("/");
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
                    navigate("/");
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

    const handleProjectDelete = () => {
        navigate("/");
        setKey(prev => prev === null ? 1 : (prev + 1) % 2);
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