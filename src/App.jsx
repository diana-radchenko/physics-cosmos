import { useEffect, useState } from "react";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import Starfield from "./components/Starfield";
import HomePage from "./pages/HomePage";
import PhysicsPage from "./pages/PhysicsPage";
import SimulatorPage from "./pages/SimulatorPage";
import AiPage from "./pages/AiPage";
import CommunityPage from "./pages/CommunityPage";
import ContactsPage from "./pages/ContactsPage";
import AboutPage from "./pages/AboutPage";

const pages = {
  home: HomePage,
  physics: PhysicsPage,
  simulator: SimulatorPage,
  ai: AiPage,
  chat: CommunityPage,
  friends: ContactsPage,
  teachers: ContactsPage,
  about: AboutPage,
};

function pageFromHash() {
  const value = window.location.hash.replace("#/", "");
  return pages[value] ? value : "home";
}

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [authOpen, setAuthOpen] = useState(false);
  const [locale, setLocale] = useState(() => localStorage.getItem("physics-locale") || "ru");
  const [username, setUsername] = useState(() => {
    try { return JSON.parse(localStorage.getItem("physics-user") || "null")?.name || ""; }
    catch { return localStorage.getItem("physics-user") || ""; }
  });

  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("physics-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const navigate = (nextPage) => {
    window.location.hash = `/${nextPage}`;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const login = (account) => {
    localStorage.setItem("physics-user", JSON.stringify(account));
    setUsername(account.name);
    setAuthOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("physics-user");
    setUsername("");
  };

  const Page = pages[page];

  return (
    <div className="app-shell">
      <Starfield />
      <Header
        currentPage={page}
        navigate={navigate}
        username={username}
        onLogin={() => setAuthOpen(true)}
        onLogout={logout}
        locale={locale}
        onLocaleChange={setLocale}
      />
      <main>
        <Page navigate={navigate} username={username} type={page} locale={locale} onRequireLogin={() => setAuthOpen(true)} />
      </main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLogin={login} locale={locale} />
    </div>
  );
}
