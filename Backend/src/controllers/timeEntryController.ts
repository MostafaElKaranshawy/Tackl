import ErrorHandler from "../exceptions/errorHandler";
import ForbiddenException from "../exceptions/forbiddenException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import NotFoundException from "../exceptions/notFoundException";
import TimeEntryService from "../services/timeEntryService";
import { validateDate, validateTime } from "../utils/validateTime";

export default class TimeEntryController {
    static async createTimeEntry(req: any, res: any) {
        try {
            const { userId } = req;
            const { projectId, taskId } = req.params;
            const timeEntryData = req.body;

            if (!projectId || !taskId || !timeEntryData.duration || !timeEntryData.date) {
                throw new MissingRequiredDataException("Missing required data for creating time entry.");
            }

            if (timeEntryData.duration && !validateTime(timeEntryData.duration)) {
                throw new MissingRequiredDataException("Invalid duration format. Please use HH:mm format (00:00 to 23:59).");
            }

            if (timeEntryData.date && !validateDate(timeEntryData.date)) {
                throw new MissingRequiredDataException("Invalid date format. Please use a valid date.");
            }

            const filteredTimeEntryData = {
                projectId: projectId,
                taskId: taskId,
                duration: timeEntryData.duration || null,
                date: timeEntryData.date || null,
                note: timeEntryData.note || null
            };
            const createdTimeEntry = await TimeEntryService.createTimeEntry(userId, filteredTimeEntryData);

            res.status(201).json(createdTimeEntry);
        } catch (error) {
            ErrorHandler(error, req, res);
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
            ErrorHandler(error, req, res);
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

            if (updatedData.duration && !validateTime(updatedData.duration)) {
                throw new MissingRequiredDataException("Invalid duration format. Please use HH:mm format (00:00 to 23:59).");
            }

            if (updatedData.date && !validateDate(updatedData.date)) {
                throw new MissingRequiredDataException("Invalid date format. Please use a valid date.");
            }

            const filteredUpdatedData = {
                projectId,
                timeEntryId,
                taskId,
                ...(updatedData.duration !== undefined && { duration: updatedData.duration }),
                ...(updatedData.date !== undefined && { date: updatedData.date }),
                ...(updatedData.note !== undefined && { note: updatedData.note }),
            };
            const updatedTimeEntry = await TimeEntryService.updateTimeEntry(userId, filteredUpdatedData);

            res.status(200).json(updatedTimeEntry);
        } catch (error) {
            ErrorHandler(error, req, res);
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
            ErrorHandler(error, req, res);
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
            ErrorHandler(error, req, res);
        }
    }
}