import { useEffect, useState } from "react";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import Starfield from "./components/Starfield";
import HomePage from "./pages/HomePage";
import PhysicsPage from "./pages/PhysicsPage";
import SimulatorPage from "./pages/SimulatorPage";
import AiPage from "./pages/AiPage";
import CommunityPage from "./pages/CommunityPage";
import FriendsChatPage from "./pages/FriendsChatPage";
import FriendsPage from "./pages/FriendsPage";
import AboutPage from "./pages/AboutPage";

const pages = {
  home: HomePage,
  physics: PhysicsPage,
  simulator: SimulatorPage,
  ai: AiPage,
  chat: CommunityPage,
  friendschat: FriendsChatPage,
  friends: FriendsPage,
  about: AboutPage,
};

function pageFromHash() {
  const value = window.location.hash.replace("#/", "");
  return pages[value] ? value : "home";
}

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [authOpen, setAuthOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("physics-user") || "");

  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (nextPage) => {
    window.location.hash = `/${nextPage}`;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const login = (name) => {
    localStorage.setItem("physics-user", name);
    setUsername(name);
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
      />
      <main>
        <Page navigate={navigate} username={username} />
      </main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLogin={login} />
    </div>
  );
}
