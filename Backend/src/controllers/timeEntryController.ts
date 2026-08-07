import ErrorHandler from "../exceptions/errorHandler";
import ForbiddenException from "../exceptions/forbiddenException";
import MissingRequiredDataException from "../exceptions/missingRequiredDataException";
import NotFoundException from "../exceptions/notFoundException";
import TimeEntryService from "../services/timeEntryService";
import { Request, Response, NextFunction } from "express";
import { validateDate, validateTime } from "../utils/validateTime";
import TimeEntry from "../models/timeEntry";

export default class TimeEntryController {
    static async createTimeEntry(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            const { projectId, taskId } = req.params;

            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }
            if (!taskId || !(taskId && typeof taskId === 'string')) {
                throw new MissingRequiredDataException("Task ID is required.");
            }
            const timeEntryData = req.body;

            if (!timeEntryData.duration || !timeEntryData.date) {
                throw new MissingRequiredDataException("Missing required data for creating time entry.");
            }

            if (timeEntryData.duration && !validateTime(timeEntryData.duration)) {
                throw new MissingRequiredDataException("Invalid duration format. Please use HH:mm format (00:00 to 23:59).");
            }

            if (timeEntryData.date && !validateDate(timeEntryData.date)) {
                throw new MissingRequiredDataException("Invalid date format. Please use a valid date.");
            }

            const filteredTimeEntryData = {
                duration: timeEntryData.duration,
                date: timeEntryData.date,
                note: timeEntryData.note || null
            };
            const createdTimeEntry = await TimeEntryService.createTimeEntry(userId, projectId, taskId, filteredTimeEntryData);

            res.status(201).json(createdTimeEntry);
        } catch (error) {
            next(error);
        }
    }

    static async getTimeEntryById(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            const { projectId, taskId, timeEntryId } = req.params;
            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            if (!taskId || !(taskId && typeof taskId === 'string')) {
                throw new MissingRequiredDataException("Task ID is required.");
            }
            if (!timeEntryId || !(timeEntryId && typeof timeEntryId === 'string')) {
                throw new MissingRequiredDataException("Time entry ID is required.");
            }

            const timeEntry = await TimeEntryService.getTimeEntryById(timeEntryId, userId, projectId, taskId);

            if (!timeEntry) {
                throw new NotFoundException("Time entry not found.");
            }

            res.status(200).json(timeEntry);
        } catch (error) {
            next(error);
        }
    }

    static async updateTimeEntry(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            const { projectId, taskId, timeEntryId } = req.params;
            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            if (!taskId || !(taskId && typeof taskId === 'string')) {
                throw new MissingRequiredDataException("Task ID is required.");
            }
            if (!timeEntryId || !(timeEntryId && typeof timeEntryId === 'string')) {
                throw new MissingRequiredDataException("Time entry ID is required.");
            }


            const updatedData = req.body as Partial<TimeEntry>;

            if (updatedData.duration && !validateTime(updatedData.duration)) {
                throw new MissingRequiredDataException("Invalid duration format. Please use HH:mm format (00:00 to 23:59).");
            }

            if (updatedData.date && !validateDate(updatedData.date)) {
                throw new MissingRequiredDataException("Invalid date format. Please use a valid date.");
            }

            if (!updatedData.duration && !updatedData.date && updatedData.note === undefined) {
                throw new MissingRequiredDataException("At least one field (duration, date, or note) must be provided for update.");
            }

            const filteredUpdatedData = {
                ...(updatedData.duration !== undefined && {
                    duration: updatedData.duration
                }),
                ...(updatedData.date !== undefined && {
                    date: updatedData.date
                }),
                ...(updatedData.note !== undefined && {
                    note: updatedData.note
                })
            };

            const updatedTimeEntry = await TimeEntryService.updateTimeEntry(userId, projectId, taskId, timeEntryId, filteredUpdatedData);

            res.status(200).json(updatedTimeEntry);
        } catch (error) {
            next(error);
        }
    }

    static async deleteTimeEntry(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            const { projectId, taskId, timeEntryId } = req.params;
            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            if (!taskId || !(taskId && typeof taskId === 'string')) {
                throw new MissingRequiredDataException("Task ID is required.");
            }
            if (!timeEntryId || !(timeEntryId && typeof timeEntryId === 'string')) {
                throw new MissingRequiredDataException("Time entry ID is required.");
            }

            await TimeEntryService.deleteTimeEntry(userId, projectId, taskId, timeEntryId);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    static async getTaskTimeEntries(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req;

            if (!userId) {
                throw new ForbiddenException("User ID is required.");
            }

            const { projectId, taskId } = req.params;
            if (!projectId || !(projectId && typeof projectId === 'string')) {
                throw new MissingRequiredDataException("Project ID is required.");
            }

            if (!taskId || !(taskId && typeof taskId === 'string')) {
                throw new MissingRequiredDataException("Task ID is required.");
            }

            const timeEntries = await TimeEntryService.getTaskTimeEntries(userId, projectId, taskId);

            res.status(200).json(timeEntries);
        } catch (error) {
            next(error);
        }
    }
}