import { pbkdf2Sync, randomBytes } from "node:crypto";

const password = (await Array.fromAsync(process.stdin)).join("").trimEnd();

if (!password) {
  throw new Error("Provide the password on standard input");
}

const iterations = 100_000;
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");

console.log(
  JSON.stringify(
    {
      password_salt: salt.toString("hex"),
      password_hash: hash.toString("hex"),
      password_iterations: iterations,
    },
    null,
    2,
  ),
);
