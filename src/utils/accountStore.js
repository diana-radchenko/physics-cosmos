const ACCOUNTS_KEY = "physics-accounts";

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}

async function passwordHash(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function registerAccount({ name, email, password }) {
  const accounts = readAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("Пользователь с такой почтой уже зарегистрирован.");
  }

  const account = {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await passwordHash(password),
  };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  return { name: account.name, email: account.email };
}

export async function loginAccount({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const hash = await passwordHash(password);
  const account = readAccounts().find(
    (item) => item.email === normalizedEmail && item.passwordHash === hash,
  );
  if (!account) throw new Error("Неверная почта или пароль.");
  return { name: account.name, email: account.email };
}
