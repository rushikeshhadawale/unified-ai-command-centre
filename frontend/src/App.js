import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import TemplatesPage from "./pages/TemplatesPage";
import SendNotificationPage from "./pages/SendNotificationPage";
import ConversationsPage from "./pages/ConversationsPage";

function App() {
  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-title">
          Unified AI Command Centre
        </div>
        <ul className="sidebar-nav">
          <li>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link--active" : "")
              }
            >
              Users
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/templates"
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link--active" : "")
              }
            >
              Templates
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/send"
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link--active" : "")
              }
            >
              Send Notification
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/conversations"
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link--active" : "")
              }
            >
              Conversations
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* MAIN AREA */}
      <div className="main-shell">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">Ops Control Panel</div>
            <div className="topbar-subtitle">
              Orchestrate WhatsApp, voice & email notifications from one place.
            </div>
          </div>
          <button className="btn btn-ghost">
            v1.0 • Demo mode
          </button>
        </header>

        {/* Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UsersPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/send" element={<SendNotificationPage />} />
            <Route path="/conversations" element={<ConversationsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
