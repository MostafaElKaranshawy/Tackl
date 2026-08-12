import { describe, expect, it, vi } from "vitest";
import {
    validatePassword,
    validateName,
    validateEmail,
    validatePasswordRules,
} from "../../src/utils/validators";

describe("validatePasswordRules", () => {
    it("should contain all required password rules", () => {
        expect(validatePasswordRules).toHaveLength(5);

        expect(validatePasswordRules.map(rule => rule.label)).toEqual([
            "At least 8 characters",
            "At least one uppercase letter",
            "At least one lowercase letter",
            "At least one number",
            "At least one special character",
        ]);
    });

    it("should validate password length", () => {
        const rule = validatePasswordRules[0];

        expect(rule.validate("Abc1!")).toBe(false);
        expect(rule.validate("Abcdef1!")).toBe(true);
    });

    it("should validate uppercase letters", () => {
        const rule = validatePasswordRules[1];

        expect(rule.validate("abcdef1!")).toBe(false);
        expect(rule.validate("Abcdef1!")).toBe(true);
    });

    it("should validate lowercase letters", () => {
        const rule = validatePasswordRules[2];

        expect(rule.validate("ABCDEF1!")).toBe(false);
        expect(rule.validate("Abcdef1!")).toBe(true);
    });

    it("should validate numbers", () => {
        const rule = validatePasswordRules[3];

        expect(rule.validate("Abcdefgh!")).toBe(false);
        expect(rule.validate("Abcdefg1!")).toBe(true);
    });

    it("should validate special characters", () => {
        const rule = validatePasswordRules[4];

        expect(rule.validate("Abcdefg1")).toBe(false);
        expect(rule.validate("Abcdefg1!")).toBe(true);
    });
});

describe("validatePassword", () => {
    it("should return true for a valid password", () => {
        const setPasswordError = vi.fn();

        const result = validatePassword(
            "Password1!",
            setPasswordError
        );

        expect(result).toBe(true);
        expect(setPasswordError).toHaveBeenLastCalledWith("");
    });

    it("should return false for a password shorter than 8 characters", () => {
        const setPasswordError = vi.fn();

        const result = validatePassword(
            "Pass1!",
            setPasswordError
        );

        expect(result).toBe(false);
        expect(setPasswordError).toHaveBeenLastCalledWith(
            "Password does not meet the required criteria."
        );
    });

    it("should return false when password has no uppercase letter", () => {
        const setPasswordError = vi.fn();

        const result = validatePassword(
            "password1!",
            setPasswordError
        );

        expect(result).toBe(false);
        expect(setPasswordError).toHaveBeenLastCalledWith(
            "Password does not meet the required criteria."
        );
    });

    it("should return false when password has no lowercase letter", () => {
        const setPasswordError = vi.fn();

        const result = validatePassword(
            "PASSWORD1!",
            setPasswordError
        );

        expect(result).toBe(false);
        expect(setPasswordError).toHaveBeenLastCalledWith(
            "Password does not meet the required criteria."
        );
    });

    it("should return false when password has no number", () => {
        const setPasswordError = vi.fn();

        const result = validatePassword(
            "Password!",
            setPasswordError
        );

        expect(result).toBe(false);
        expect(setPasswordError).toHaveBeenLastCalledWith(
            "Password does not meet the required criteria."
        );
    });

    it("should return false when password has no special character", () => {
        const setPasswordError = vi.fn();

        const result = validatePassword(
            "Password1",
            setPasswordError
        );

        expect(result).toBe(false);
        expect(setPasswordError).toHaveBeenLastCalledWith(
            "Password does not meet the required criteria."
        );
    });

    it("should clear the error when the password is valid", () => {
        const setPasswordError = vi.fn();

        validatePassword(
            "Password1!",
            setPasswordError
        );

        expect(setPasswordError).toHaveBeenCalledWith("");
    });

    it("should set the error when the password is invalid", () => {
        const setPasswordError = vi.fn();

        validatePassword(
            "password",
            setPasswordError
        );

        expect(setPasswordError).toHaveBeenLastCalledWith(
            "Password does not meet the required criteria."
        );
    });
});

describe("validateName", () => {
    it("should return true for a valid name", () => {
        const setNameError = vi.fn();

        const result = validateName(
            "John Doe",
            setNameError
        );

        expect(result).toBe(true);
        expect(setNameError).toHaveBeenLastCalledWith("");
    });

    it("should return false when name is empty", () => {
        const setNameError = vi.fn();

        const result = validateName(
            "",
            setNameError
        );

        expect(result).toBe(false);
        expect(setNameError).toHaveBeenLastCalledWith(
            "Name is required"
        );
    });

    it("should return false when name contains numbers", () => {
        const setNameError = vi.fn();

        const result = validateName(
            "John123",
            setNameError
        );

        expect(result).toBe(false);
        expect(setNameError).toHaveBeenLastCalledWith(
            "Name can only contain english letters and spaces"
        );
    });

    it("should return false when name contains special characters", () => {
        const setNameError = vi.fn();

        const result = validateName(
            "John@Doe",
            setNameError
        );

        expect(result).toBe(false);
        expect(setNameError).toHaveBeenLastCalledWith(
            "Name can only contain english letters and spaces"
        );
    });

    it("should return true for a name containing spaces", () => {
        const setNameError = vi.fn();

        const result = validateName(
            "John Michael Doe",
            setNameError
        );

        expect(result).toBe(true);
        expect(setNameError).toHaveBeenLastCalledWith("");
    });
});

describe("validateEmail", () => {
    it("should return true for a valid email", () => {
        const setEmailError = vi.fn();

        const result = validateEmail(
            "test@example.com",
            setEmailError
        );

        expect(result).toBe(true);
        expect(setEmailError).toHaveBeenLastCalledWith("");
    });

    it("should return false when email is empty", () => {
        const setEmailError = vi.fn();

        const result = validateEmail(
            "",
            setEmailError
        );

        expect(result).toBe(false);
        expect(setEmailError).toHaveBeenLastCalledWith(
            "Email is required"
        );
    });

    it("should return false when email has no @ symbol", () => {
        const setEmailError = vi.fn();

        const result = validateEmail(
            "testexample.com",
            setEmailError
        );

        expect(result).toBe(false);
        expect(setEmailError).toHaveBeenLastCalledWith(
            "Email is invalid"
        );
    });

    it("should return false when email has no domain", () => {
        const setEmailError = vi.fn();

        const result = validateEmail(
            "test@",
            setEmailError
        );

        expect(result).toBe(false);
        expect(setEmailError).toHaveBeenLastCalledWith(
            "Email is invalid"
        );
    });

    it("should return false when email has no valid extension", () => {
        const setEmailError = vi.fn();

        const result = validateEmail(
            "test@example.c",
            setEmailError
        );

        expect(result).toBe(false);
        expect(setEmailError).toHaveBeenLastCalledWith(
            "Email is invalid"
        );
    });

    it("should return true for an email containing allowed special characters", () => {
        const setEmailError = vi.fn();

        const result = validateEmail(
            "test.user+tag@example.com",
            setEmailError
        );

        expect(result).toBe(true);
        expect(setEmailError).toHaveBeenLastCalledWith("");
    });
});