import { test, describe, expectTypeOf } from "vitest";
import { gate, prepareGate } from "./gate.js";

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

  test("Returntype", () => {
    const user: User = {
      isAdmin: true,
      isUser: false,
      isGuest: false,
      company: "Cotton-Coding",
    };
    const gateRunner = gate(
      isAuthorized("isAdmin", true),
      isAuthorized("company", "Cotton-Coding")
    );
    expectTypeOf(gateRunner).parameter(0).toEqualTypeOf<User>();
    expectTypeOf(gateRunner(user)).toEqualTypeOf<[User]>();
  });

  test("Returntype with modifier", () => {
    const user: User = {
      isAdmin: true,
      isUser: false,
      isGuest: false,
      company: "Cotton-Coding",
    };
    const preparedGate = prepareGate(({ company }: User) => [company]);
    const gateRunner = preparedGate(
      (company: string) => company === "Cotton-Coding"
    );
    expectTypeOf(gateRunner).parameter(0).toEqualTypeOf<User>();
    expectTypeOf(gateRunner(user)).toEqualTypeOf<[User]>();
  });
});
