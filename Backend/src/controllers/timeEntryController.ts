import ForbiddenException from "../exceptions/forbiddenException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import NotFoundException from "../exceptions/notFoundException";
import TimeEntryService from "../services/timeEntryService";

export default class TimeEntryController {
    static async createTimeEntry(req: any, res: any) {
        try {
            const { userId } = req;
            const { taskId } = req.params;
            const timeEntryData = req.body;

            if (!taskId || !timeEntryData.duration || !timeEntryData.date) {
                throw new MissingRequiredDataException("Missing required data for creating time entry.");
            }
            const filteredTimeEntryData = {
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
            const { taskId, timeEntryId } = req.params;

            if (!taskId) {
                throw new MissingRequiredDataException("Missing required data: taskId.");
            }

            const timeEntry = await TimeEntryService.getTimeEntryById(timeEntryId, userId, taskId);

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
            const { taskId, timeEntryId } = req.params;
            const updatedData = req.body;

            if (!timeEntryId || !taskId) {
                throw new MissingRequiredDataException("Missing required data for updating time entry.");
            }
            const filteredUpdatedData = {
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
            const { timeEntryId } = req.params;

            if (!timeEntryId) {
                throw new MissingRequiredDataException("Missing required data for deleting time entry.");
            }

            await TimeEntryService.deleteTimeEntry(userId, timeEntryId);

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
            const { taskId } = req.params;

            if (!taskId) {
                throw new MissingRequiredDataException("Missing required data: taskId.");
            }
            const timeEntries = await TimeEntryService.getTaskTimeEntries(userId, taskId);

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