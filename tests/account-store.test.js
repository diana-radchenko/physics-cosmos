import assert from "node:assert/strict";
import { loginAccount, registerAccount, resetAccountPassword } from "../src/utils/accountStore.js";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
};

await registerAccount({
  name: "Test Student",
  email: "student@example.com",
  password: "old-password",
  role: "student",
  classNumber: "9A",
  classDirection: "Physics",
  birthDate: "2010-04-18",
  schoolNumber: "57",
  subject: "",
});

await resetAccountPassword({
  email: "student@example.com",
  role: "student",
  schoolNumber: "57",
  birthDate: "2010-04-18",
  subject: "",
  newPassword: "new-password",
});

await assert.rejects(() => loginAccount({ email: "student@example.com", password: "old-password" }));
const profile = await loginAccount({ email: "student@example.com", password: "new-password" });
assert.equal(profile.name, "Test Student");
console.log("Account password recovery: passed");
