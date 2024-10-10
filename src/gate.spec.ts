import { test, describe, expect } from "vitest";
import { gate, GateException } from "./gate";

describe("combine", () => {
  interface User {
    isAdmin: boolean;
    isUser: boolean;
    isGuest: boolean;
    company?: string;
  }
  const isAuthorized =
    (attr: keyof User, value: string | number | boolean) => (user: User) =>
      user[attr] === value;

  test("Success", () => {
    const user: User = {
      isAdmin: true,
      isUser: false,
      isGuest: false,
      company: "Cotton-Coding",
    };
    const gateRunner = gate(
      isAuthorized("isAdmin", true),
      isAuthorized("company", "Cotton-Coding"),
    );
    expect(gateRunner(user)).toEqual([user]);
  });

  test("Throws error", () => {
    const user: User = {
      isAdmin: false,
      isUser: true,
      isGuest: false,
      company: "Cotton-Coding",
    };
    const gateRunner = gate(
      isAuthorized("isAdmin", true),
      isAuthorized("company", "Cotton-Coding"),
    );
    expect(() => gateRunner(user)).toThrowError(GateException);
    try {
      gateRunner(user);
    } catch (e) {
      expect(e.result).toEqual([false, true]);
    }
  });
});
