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
      <h1>Users</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
          <h3>Add User</h3>
          <div>
            <label>Name</label><br />
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label>Phone Number</label><br />
            <input
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            />
          </div>
          <div>
            <label>Email</label><br />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label>User Type</label><br />
            <select
              value={form.user_type}
              onChange={(e) => setForm({ ...form, user_type: e.target.value })}
            >
              <option value="EMPLOYER">Employer</option>
              <option value="MAID">Maid</option>
            </select>
          </div>
          <div>
            <label>Preferred Language</label><br />
            <select
              value={form.preferred_language}
              onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="kn">Kannada</option>
              <option value="ne">Nepali</option>
            </select>
          </div>
          <button type="submit" style={{ marginTop: "0.5rem" }}>Save</button>
        </form>

        <div style={{ flex: 1 }}>
          <h3>Existing Users</h3>
          <table style={{ width: "100%", background: "white", borderRadius: "8px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Type</th>
                <th>Lang</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
