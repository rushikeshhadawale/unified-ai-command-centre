import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    email: "",
    user_type: "EMPLOYER",
    preferred_language: "en",
  });

  async function loadUsers() {
    try {
      const data = await apiGet("/users");
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiPost("/users", form);
      setForm({
        name: "",
        phone_number: "",
        email: "",
        user_type: "EMPLOYER",
        preferred_language: "en",
      });
      loadUsers();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <h1 className="page-title">Users & Segments</h1>
      <p className="page-subtitle">
        Onboard employers and maids, capture language preferences and prepare segments for flows.
      </p>

      <div className="card-grid">
        {/* Left: create user */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Add New User</div>
              <div className="card-subtitle">
                Create an employer or maid with phone & language.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="input"
                placeholder="WhatsApp number"
                value={form.phone_number}
                onChange={(e) =>
                  setForm({ ...form, phone_number: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (optional)</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">User Type</label>
              <select
                className="select"
                value={form.user_type}
                onChange={(e) =>
                  setForm({ ...form, user_type: e.target.value })
                }
              >
                <option value="EMPLOYER">Employer</option>
                <option value="MAID">Maid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Language</label>
              <select
                className="select"
                value={form.preferred_language}
                onChange={(e) =>
                  setForm({ ...form, preferred_language: e.target.value })
                }
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
                <option value="ne">Nepali</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
              Save User
            </button>
          </form>
        </div>

        {/* Right: users table */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">User Directory</div>
              <div className="card-subtitle">
                {users.length} user(s) currently onboarded.
              </div>
            </div>
            <button className="btn btn-ghost" onClick={loadUsers}>
              Refresh
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Lang</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.phone_number}</td>
                    <td>{u.email}</td>
                    <td>{u.user_type}</td>
                    <td>{u.preferred_language}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            u.status === "ACTIVE"
                              ? "rgba(34,197,94,0.2)"
                              : "rgba(248,113,113,0.2)",
                          color:
                            u.status === "ACTIVE"
                              ? "#4ade80"
                              : "#fca5a5",
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7}>No users yet. Add one on the left.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
