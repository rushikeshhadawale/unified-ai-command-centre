import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    name: "",
    channel: "WHATSAPP_TEXT",
    language: "en",
    body: "",
  });

  async function loadTemplates() {
    try {
      const data = await apiGet("/templates");
      setTemplates(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await apiPost("/templates", form);
      setForm({
        name: "",
        channel: "WHATSAPP_TEXT",
        language: "en",
        body: "",
      });
      loadTemplates();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <h1>Templates</h1>
      <div style={{ display: "flex", gap: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
          <h3>Add Template</h3>
          <div>
            <label>Name</label><br />
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label>Channel</label><br />
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
            >
              <option value="WHATSAPP_TEXT">WhatsApp Text</option>
              <option value="WHATSAPP_VOICE">WhatsApp Voice</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>
          <div>
            <label>Language</label><br />
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="kn">Kannada</option>
              <option value="ne">Nepali</option>
            </select>
          </div>
          <div>
            <label>Body (use {"{name}"} etc.)</label><br />
            <textarea
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          <button type="submit" style={{ marginTop: "0.5rem" }}>Save</button>
        </form>

        <div style={{ flex: 1 }}>
          <h3>Existing Templates</h3>
          <table style={{ width: "100%", background: "white", borderRadius: "8px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Channel</th>
                <th>Lang</th>
                <th>Body</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.channel}</td>
                  <td>{t.language}</td>
                  <td>{t.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TemplatesPage;
