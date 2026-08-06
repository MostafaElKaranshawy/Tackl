import ForbiddenException from "../exceptions/forbiddenException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import NotFoundException from "../exceptions/notFoundException";
import TimeEntryService from "../services/timeEntryService";

export default class TimeEntryController {
    static async createTimeEntry(req: any, res: any) {
        try {
            const { userId } = req;
            const { projectId, taskId } = req.params;
            const timeEntryData = req.body;

            if (!projectId || !taskId || !timeEntryData.duration || !timeEntryData.date) {
                throw new MissingRequiredDataException("Missing required data for creating time entry.");
            }
            const filteredTimeEntryData = {
                projectId: projectId,
                taskId: taskId,
                duration: timeEntryData.duration,
                date: timeEntryData.date,
                note: timeEntryData.note || null
            };
            const createdTimeEntry = await TimeEntryService.createTimeEntry(userId, filteredTimeEntryData);

            res.status(201).json(createdTimeEntry);
        } catch (error) {
            if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async getTimeEntryById(req: any, res: any) {
        try {
            const { userId } = req;
            const { projectId, taskId, timeEntryId } = req.params;

            if (!projectId || !taskId) {
                throw new MissingRequiredDataException("Missing required data: projectId or taskId.");
            }

            const timeEntry = await TimeEntryService.getTimeEntryById(timeEntryId, userId, projectId, taskId);

            if (!timeEntry) {
                throw new NotFoundException("Time entry not found.");
            }

            res.status(200).json(timeEntry);
        } catch (error) {
            if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async updateTimeEntry(req: any, res: any) {
        try {
            const { userId } = req;
            const { projectId, taskId, timeEntryId } = req.params;
            const updatedData = req.body;

            if (!timeEntryId || !taskId || !projectId) {
                throw new MissingRequiredDataException("Missing required data for updating time entry.");
            }
            const filteredUpdatedData = {
                projectId: projectId,
                timeEntryId: timeEntryId,
                taskId: taskId,
                duration: updatedData.duration,
                date: updatedData.date,
                note: updatedData.note
            };
            const updatedTimeEntry = await TimeEntryService.updateTimeEntry(userId, filteredUpdatedData);

            res.status(200).json(updatedTimeEntry);
        } catch (error) {
            if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async deleteTimeEntry(req: any, res: any) {
        try {
            const { userId } = req;
            const { projectId, taskId, timeEntryId } = req.params;

            if (!projectId || !taskId || !timeEntryId) {
                throw new MissingRequiredDataException("Missing required data for deleting time entry.");
            }

            await TimeEntryService.deleteTimeEntry(userId, projectId, taskId, timeEntryId);

            res.status(204).send();
        } catch (error) {
            if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }

    static async getTaskTimeEntries(req: any, res: any) {
        try {
            const { userId } = req;
            const { projectId, taskId } = req.params;

            if (!projectId || !taskId) {
                throw new MissingRequiredDataException("Missing required data: projectId or taskId.");
            }
            const timeEntries = await TimeEntryService.getTaskTimeEntries(userId, projectId, taskId);

            res.status(200).json(timeEntries);
        } catch (error) {
            if (error instanceof MissingRequiredDataException) {
                res.status(400).json({ message: error.message });
            } else if (error instanceof ForbiddenException) {
                res.status(403).json({ message: error.message });
            } else if (error instanceof NotFoundException) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: (error as Error).message });
            }
        }
    }
}