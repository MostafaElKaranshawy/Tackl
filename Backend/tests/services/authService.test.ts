import { afterEach, assert, describe, expect, it, vi } from "vitest";
import AuthService from "../../src/services/authService";
import UserRepository from "../../src/repositories/userRepository";
import User from "../../src/models/user";
import bcrypt from "bcrypt";
import Jwt from "../../src/config/jwt";
import WrongCredentialsException from "../../src/exceptions/wrongCredentialsException";
import EmailService from "../../src/services/emailService";
import AlreadyExistsException from "../../src/exceptions/alreadyExistsException";
import NotFoundException from "../../src/exceptions/notFoundException";
import EmailAlreadyConfirmedException from "../../src/exceptions/emailAlreadyConfirmed";

describe("AuthService", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it("should authenticate a user with valid credentials", async () => {
        // Mock
        const hashedPassword = await bcrypt.hash("Mostafa1#", 10);
        vi.spyOn(UserRepository, "getUserByEmail").mockResolvedValue({
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            password: hashedPassword,
            confirmed: true,
            lastLinkTime: new Date(),
        } as User);

        vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
            return "mocked-jwt-token";
        });
        // call
        const result = await AuthService.login("test@example.com", "Mostafa1#");

        // assert
        expect(result).toBe("mocked-jwt-token");
    });

    
    it("Sign up with a new user", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "createUser").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "test@example.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(),
            } as User);

            vi.spyOn(EmailService, "sendEmail").mockResolvedValue();
            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });

            // call
            await AuthService.signUp("Mostafa", "test@example.com", "Mostafa1#");
        } catch (error) {
            assert.fail("Sign up should not throw an error");
        }
    });
    
    it("Login with wrong credentials - wrong password", async () => {
        // Mock
        const hashedPassword = await bcrypt.hash("Mostafa1#", 10);
        vi.spyOn(UserRepository, "getUserByEmail").mockResolvedValue({
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            password: hashedPassword,
            confirmed: true,
            lastLinkTime: new Date(),
        } as User);

        vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
            return "mocked-jwt-token";
        });
        // call
        try {
            await AuthService.login("test@example.com", "WrongPassword");
            assert.fail("Login should throw an error for wrong password");
        } catch (error) {
            expect(error).toBeInstanceOf(WrongCredentialsException);
        }
    });

    
    it("Login with wrong credentials - wrong email", async () => {
        // Mock
        vi.spyOn(User, "findOne").mockResolvedValue(null);

        vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
            return "mocked-jwt-token";
        });
        // call
        try {
            await AuthService.login("test@example.com", "WrongPassword");
            assert.fail("Login should throw an error for wrong email");
        } catch (error) {
            expect(error).toBeInstanceOf(WrongCredentialsException);
        }
    });

    
    it("Login with unconfirmed email", async () => {
        // Mock
        vi.spyOn(User, "findOne").mockResolvedValue({
            id: "user-1",
            name: "Mostafa",
            email: "test@example.com",
            password: "hashedPassword",
            confirmed: false,
            lastLinkTime: new Date(),
        } as User);

        vi.spyOn(bcrypt, "compare").mockImplementation(async () => true);

        vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
            return "mocked-jwt-token";
        });
        // call
        try {
            await AuthService.login("test@example.com", "hashedPassword");
            assert.fail("Login should throw an error for unconfirmed email");
        } catch (error) {
            expect((error as Error).message).toEqual("Email not confirmed. Please check your inbox for the confirmation email.");
        }
    });

    
    it("Sign up with an existing email", async () => {
        try {
            vi.spyOn(EmailService, "sendEmail").mockResolvedValue();

            vi.spyOn(User, "findOne").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "test@example.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(),
            } as User);


            await AuthService.signUp("Mostafa", "test@example.com", "Mostafa1#");
            assert.fail("Sign up should throw an error for existing email");
        } catch (error) {
            expect(error).toBeInstanceOf(AlreadyExistsException);
        }
    });


    
    it("Confirm email for a user", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "confirmUserEmail").mockResolvedValue();

            // call
            await AuthService.confirmEmail("user-1");
        } catch {
            assert.fail("Confirm email should not throw an error");
        }
    });

    
    it("Confirm email with wrong ID", async () => {
        try {
            // Mock
            vi.spyOn(User, "findOne").mockResolvedValue(null);

            // call
            await AuthService.confirmEmail("user-1");
            assert.fail("Confirm email should throw an error for non-existing user");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    

    it("Get confirmation link for a user", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "getUserByEmail").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(Date.now() - 60 * 60 * 1000),
            } as User);

            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });
            vi.spyOn(UserRepository, "updateUser").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(),
            } as User);
            vi.spyOn(EmailService, "sendEmail").mockResolvedValue();

            // call
            await AuthService.getConfirmationLink("example@gmail.com");
        } catch (error) {
            assert.fail("Get confirmation link should not throw an error");
        }
    });

    

    it("Get confirmation link for a user who has confirmed their email", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "getUserByEmail").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: true,
                lastLinkTime: new Date(Date.now() - 60 * 60 * 1000),
            } as User);

            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });

            // call
            await AuthService.getConfirmationLink("example@gmail.com");
            assert.fail("Get confirmation link should throw an error for already confirmed email");
        } catch (error) {
            expect(error).toBeInstanceOf(EmailAlreadyConfirmedException);
        }
    });

    

    it("Get confirmation link for a user who has request a confirmation link recently", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "getUserByEmail").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(Date.now()),
            } as User);

            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });

            // call
            await AuthService.getConfirmationLink("example@gmail.com");
            assert.fail("Get confirmation link should throw an error for recently requested link");
        } catch (error) {
            expect(error).toBeInstanceOf(AlreadyExistsException);
        }
    });

    

    it("Get confirmation link for a user who has request a confirmation link recently", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "getUserByEmail").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(Date.now()),
            } as User);

            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });

            // call
            await AuthService.getConfirmationLink("example@gmail.com");
            assert.fail("Get confirmation link should throw an error for recently requested link");
        } catch (error) {
            expect(error).toBeInstanceOf(AlreadyExistsException);
        }
    });

    
    it("Reset password link for a not found user", async () => {
        try {
            // Mock
            vi.spyOn(User, "findByPk").mockResolvedValue(null);
            
            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });

            // call
            await AuthService.resetPassword("newPassword", "user-1");
            assert.fail("Get reset password link should throw an error for non-existent user");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    

    it("Reset password for a not found user", async () => {
        try {
            // Mock
            vi.spyOn(User, "findByPk").mockResolvedValue(null);
            
            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });

            // call
            await AuthService.resetPassword("newPassword", "user-1");
            assert.fail("Get reset password link should throw an error for non-existent user");
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }
    });

    it("Get reset password link for a user", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "getUserByEmail").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(Date.now() - 60 * 60 * 1000),
            } as User);

            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });
            vi.spyOn(UserRepository, "updateUser").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(),
            } as User);
            vi.spyOn(EmailService, "sendEmail").mockResolvedValue();

            // call
            await AuthService.getResetPasswordLink("example@gmail.com");
        } catch (error) {
            assert.fail("Get reset password link should not throw an error");
        }
    });

    

    it("Get reset password link for a user who has request a reset password link recently", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "getUserByEmail").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(Date.now()),
            } as User);

            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });

            // call
            await AuthService.getResetPasswordLink("example@gmail.com");
            assert.fail("Get reset password link should throw an error for recently requested link");
        } catch (error) {
            expect(error).toBeInstanceOf(AlreadyExistsException);
        }
    });

    

    it("Get reset password link for a user who has request a reset password link recently", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "getUserByEmail").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: false,
                lastLinkTime: new Date(Date.now()),
            } as User);

            vi.spyOn(Jwt, "generateToken").mockImplementation((payload: object) => {
                return "mocked-jwt-token";
            });

            // call
            await AuthService.getResetPasswordLink("example@gmail.com");
            assert.fail("Get reset password link should throw an error for recently requested link");
        } catch (error) {
            expect(error).toBeInstanceOf(AlreadyExistsException);
        }
    });

    

    it("Reset password for a user", async () => {
        try {
            // Mock
            vi.spyOn(UserRepository, "getUserById").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedPassword",
                confirmed: true,
                lastLinkTime: new Date(Date.now() - 60 * 60 * 1000),
            } as User);

            vi.spyOn(UserRepository, "updateUser").mockResolvedValue({
                id: "user-1",
                name: "Mostafa",
                email: "example@gmail.com",
                password: "hashedNewPassword",
                confirmed: true,
                lastLinkTime: new Date(Date.now() - 60 * 60 * 1000),
            } as User);

            // call
            await AuthService.resetPassword("newPassword", "user-1");
        } catch (error) {
            assert.fail("Reset password should not throw an error");
        }
    });
});
