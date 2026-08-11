import { afterEach, assert, describe, expect, it, vi } from "vitest";
import UserRepository from "../../src/repositories/userRepository";
import User from "../../src/models/user";
import NotFoundException from "../../src/exceptions/notFoundException";
import AlreadyExistsException from "../../src/exceptions/alreadyExistsException";
import DBException from "../../src/exceptions/dbException";

describe("UserRepository", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("Create a new user", async () => {
        vi.spyOn(User, "findOne").mockResolvedValue(null);

        vi.spyOn(User, "create").mockResolvedValue({
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            password: "hashed-password",
        } as unknown as User);

        const result = await UserRepository.createUser(
            "Mostafa",
            "test@example.com",
            "hashed-password"
        );

        expect(result).toEqual({
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            password: "hashed-password",
        });
    });

    it("Create a user with an existing email", async () => {
        vi.spyOn(User, "findOne").mockResolvedValue({
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            password: "hashed-password",
        } as unknown as User);

        try {
            await UserRepository.createUser(
                "Mostafa",
                "test@example.com",
                "hashed-password"
            );

            assert.fail("Expected AlreadyExistsException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(AlreadyExistsException);
        }
    });

    it("Create a user when database creation fails", async () => {
        vi.spyOn(User, "findOne").mockResolvedValue(null);

        vi.spyOn(User, "create").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await UserRepository.createUser(
                "Mostafa",
                "test@example.com",
                "hashed-password"
            );

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get a user by valid ID", async () => {
        const mockUser = {
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            password: "hashed-password",
        } as unknown as User;

        vi.spyOn(User, "findByPk").mockResolvedValue(mockUser);

        const result = await UserRepository.getUserById("user-1");

        expect(result).toBe(mockUser);
    });

    it("Get a user by invalid ID", async () => {
        vi.spyOn(User, "findByPk").mockResolvedValue(null);

        try {
            await UserRepository.getUserById("wrong-id");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Get a user by ID when database fails", async () => {
        vi.spyOn(User, "findByPk").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await UserRepository.getUserById("user-1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Get a user by valid email", async () => {
        const mockUser = {
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            password: "hashed-password",
        } as unknown as User;

        vi.spyOn(User, "findOne").mockResolvedValue(mockUser);

        const result = await UserRepository.getUserByEmail(
            "test@example.com"
        );

        expect(result).toBe(mockUser);
    });

    it("Get a user by invalid email", async () => {
        vi.spyOn(User, "findOne").mockResolvedValue(null);

        try {
            await UserRepository.getUserByEmail("wrong@example.com");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Get a user by email when database fails", async () => {
        vi.spyOn(User, "findOne").mockRejectedValue(
            new Error("Database error")
        );

        try {
            await UserRepository.getUserByEmail("test@example.com");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Confirm a user's email", async () => {
        const mockUser = {
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            confirmed: false,
            save: vi.fn().mockResolvedValue(undefined),
        } as unknown as User;

        vi.spyOn(User, "findByPk").mockResolvedValue(mockUser);

        await UserRepository.confirmUserEmail("user-1");

        expect(mockUser.confirmed).toBe(true);
        expect(mockUser.save).toHaveBeenCalled();
    });

    it("Confirm email for an invalid user ID", async () => {
        vi.spyOn(User, "findByPk").mockResolvedValue(null);

        try {
            await UserRepository.confirmUserEmail("wrong-id");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Confirm email when saving fails", async () => {
        const mockUser = {
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            confirmed: false,
            save: vi.fn().mockRejectedValue(new Error("Database error")),
        } as unknown as User;

        vi.spyOn(User, "findByPk").mockResolvedValue(mockUser);

        try {
            await UserRepository.confirmUserEmail("user-1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Update a user", async () => {
        const mockUser = {
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            password: "hashed-password",
            update: vi.fn().mockResolvedValue(undefined),
        } as unknown as User;

        vi.spyOn(User, "findByPk").mockResolvedValue(mockUser);

        const updates = {
            name: "Updated Mostafa",
            email: "updated@example.com",
        };

        const result = await UserRepository.updateUser(
            "user-1",
            updates
        );

        expect(mockUser.update).toHaveBeenCalledWith(updates);
        expect(result).toBe(mockUser);
    });

    it("Update a user with an invalid ID", async () => {
        vi.spyOn(User, "findByPk").mockResolvedValue(null);

        try {
            await UserRepository.updateUser("wrong-id", {
                name: "Updated Mostafa",
            });

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Update a user when database update fails", async () => {
        const mockUser = {
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            update: vi.fn().mockRejectedValue(
                new Error("Database error")
            ),
        } as unknown as User;

        vi.spyOn(User, "findByPk").mockResolvedValue(mockUser);

        try {
            await UserRepository.updateUser("user-1", {
                name: "Updated Mostafa",
            });

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });

    it("Delete a user", async () => {
        const mockUser = {
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            destroy: vi.fn().mockResolvedValue(undefined),
        } as unknown as User;

        vi.spyOn(User, "findByPk").mockResolvedValue(mockUser);

        await UserRepository.deleteUser("user-1");

        expect(mockUser.destroy).toHaveBeenCalled();
    });

    it("Delete a user with an invalid ID", async () => {
        vi.spyOn(User, "findByPk").mockResolvedValue(null);

        try {
            await UserRepository.deleteUser("wrong-id");

            assert.fail("Expected NotFoundException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Delete a user when database deletion fails", async () => {
        const mockUser = {
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            destroy: vi.fn().mockRejectedValue(
                new Error("Database error")
            ),
        } as unknown as User;

        vi.spyOn(User, "findByPk").mockResolvedValue(mockUser);

        try {
            await UserRepository.deleteUser("user-1");

            assert.fail("Expected DBException to be thrown");
        } catch (error) {
            expect(error).toBeInstanceOf(DBException);
        }
    });
});