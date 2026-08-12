import { describe, it, expect } from "vitest";
import {formatMinutes } from "../../src/utils/timeFormater";

describe("formatMinutes", () => {
    it("should format minutes correctly for less than an hour", () => {
        expect(formatMinutes(45)).toBe("45m");
    });

    it("should format minutes correctly for more than an hour but less than a day", () => {
        expect(formatMinutes(125)).toBe("2h 5m");
    });

    it("should format minutes correctly for more than a day", () => {
        expect(formatMinutes(1500)).toBe("1d 1h");
    });

    it("should format minutes correctly for exactly one day", () => {
        expect(formatMinutes(1440)).toBe("1d");
    });

    it("should format minutes correctly for zero minutes", () => {
        expect(formatMinutes(0)).toBe("0m");
    });
});