export default function ProjectCard({ project }: { project: { id: string; name: string; description: string } }) {
    return (
        <div className="project-card p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <p className="text-md font-semibold mb-2 text-[#0a63d7]">{project.name}</p>
            <p className="text-[#6b7280] text-sm">{project.description}</p>
        </div>
    );
}