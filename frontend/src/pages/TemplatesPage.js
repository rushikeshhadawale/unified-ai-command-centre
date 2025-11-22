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
      <h1 className="page-title">Message Templates</h1>
      <p className="page-subtitle">
        Define reusable WhatsApp, voice and email templates in multiple languages.
      </p>

      <div className="card-grid">
        {/* Left: Add template */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Create Template</div>
              <div className="card-subtitle">
                Use placeholders like {"{name}"} or {"{salary_amount}"} in the body.
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
              <label className="form-label">Channel</label>
              <select
                className="select"
                value={form.channel}
                onChange={(e) =>
                  setForm({ ...form, channel: e.target.value })
                }
              >
                <option value="WHATSAPP_TEXT">WhatsApp Text</option>
                <option value="WHATSAPP_VOICE">WhatsApp Voice</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <select
                className="select"
                value={form.language}
                onChange={(e) =>
                  setForm({ ...form, language: e.target.value })
                }
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="kn">Kannada</option>
                <option value="ne">Nepali</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Body
                <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                  {" "}
                  (e.g. Hi {"{name}"}, salary {"{salary_amount}"} is due on {"{due_date}"} )
                </span>
              </label>
              <textarea
                className="textarea"
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: "0.5rem" }}
            >
              Save Template
            </button>
          </form>
        </div>

        {/* Right: Template list */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Template Library</div>
              <div className="card-subtitle">
                {templates.length} template(s) available across channels.
              </div>
            </div>
            <button className="btn btn-ghost" onClick={loadTemplates}>
              Refresh
            </button>
          </div>

          <div className="table-wrapper">
            <table className="table">
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
                    <td style={{ maxWidth: "320px" }}>{t.body}</td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr>
                    <td colSpan={5}>No templates yet. Add one on the left.</td>
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

export default TemplatesPage;
