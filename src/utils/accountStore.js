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

export async function registerAccount({ name, email, password, role, classNumber, classDirection, birthDate, schoolNumber, subject }) {
  const accounts = readAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("Пользователь с такой почтой уже зарегистрирован.");
  }

  const account = {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await passwordHash(password),
    role,
    schoolNumber: schoolNumber.trim(),
    ...(role === "student" ? {
      classNumber: classNumber.trim(),
      classDirection: classDirection.trim(),
      birthDate,
    } : { subject: subject.trim() }),
  };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  const { passwordHash: _, ...profile } = account;
  return profile;
}

export async function loginAccount({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const hash = await passwordHash(password);
  const account = readAccounts().find(
    (item) => item.email === normalizedEmail && item.passwordHash === hash,
  );
  if (!account) throw new Error("Неверная почта или пароль.");
  const { passwordHash: _, ...profile } = account;
  return profile;
}

export async function resetAccountPassword({ email, role, schoolNumber, birthDate, subject, newPassword }) {
  const accounts = readAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  const accountIndex = accounts.findIndex((account) => account.email === normalizedEmail);
  if (accountIndex < 0) throw new Error("ACCOUNT_NOT_FOUND");

  const account = accounts[accountIndex];
  const schoolMatches = account.schoolNumber.trim().toLowerCase() === schoolNumber.trim().toLowerCase();
  const roleDetailsMatch = role === "student"
    ? account.role === "student" && account.birthDate === birthDate
    : account.role === "teacher" && account.subject.trim().toLowerCase() === subject.trim().toLowerCase();
  if (!schoolMatches || !roleDetailsMatch) throw new Error("RECOVERY_DETAILS_MISMATCH");
  if (newPassword.length < 8) throw new Error("PASSWORD_TOO_SHORT");

  accounts[accountIndex] = { ...account, passwordHash: await passwordHash(newPassword) };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
