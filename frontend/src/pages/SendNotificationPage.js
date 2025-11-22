import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

function SendNotificationPage() {
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [form, setForm] = useState({
    channel: "WHATSAPP_TEXT",
    template_id: "",
    variables: "",
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [u, t] = await Promise.all([apiGet("/users"), apiGet("/templates")]);
        setUsers(u);
        setTemplates(t);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  function toggleUser(id) {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!form.template_id || selectedUsers.length === 0) {
      alert("Please select at least one user and a template.");
      return;
    }

    let variablesObj = {};
    if (form.variables.trim()) {
      try {
        variablesObj = JSON.parse(form.variables);
      } catch (e) {
        alert('Variables must be valid JSON, e.g. {"salary_amount": 8000}');
        return;
      }
    }

    try {
      const payload = {
        channel: form.channel,
        template_id: parseInt(form.template_id),
        user_ids: selectedUsers,
        variables: variablesObj,
      };
      const res = await apiPost("/notifications/send", payload);
      setResult(res);
    } catch (e) {
      console.error(e);
      alert("Error sending notifications");
    }
  }

  return (
    <div>
      <h1 className="page-title">Broadcast & Flows</h1>
      <p className="page-subtitle">
        Trigger WhatsApp text, voice or email messages using templates and segments.
      </p>

      <div className="card-grid">
        {/* Left: Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Compose Notification</div>
              <div className="card-subtitle">
                Choose channel, template and dynamic variables.
              </div>
            </div>
          </div>

          <form onSubmit={handleSend}>
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
              <label className="form-label">Template</label>
              <select
                className="select"
                value={form.template_id}
                onChange={(e) =>
                  setForm({ ...form, template_id: e.target.value })
                }
              >
                <option value="">-- Select template --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.channel}, {t.language})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Variables (JSON)
                <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                  {" "}
                  e.g. {"{\"salary_amount\": 8000, \"due_date\": \"30 Nov\"}"}
                </span>
              </label>
              <textarea
                className="textarea"
                rows={3}
                placeholder='{"salary_amount": 8000, "due_date": "30 Nov"}'
                value={form.variables}
                onChange={(e) =>
                  setForm({ ...form, variables: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recipients</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {users.map((u) => (
                  <label
                    key={u.id}
                    className={
                      "pill" + (selectedUsers.includes(u.id) ? " pill--active" : "")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                      style={{ display: "none" }}
                    />
                    {u.name} • {u.phone_number}
                  </label>
                ))}
                {users.length === 0 && (
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    No users yet – go to Users page to add.
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: "0.75rem" }}
            >
              Send Notification
            </button>
          </form>
        </div>

        {/* Right: Result / Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Delivery Console</div>
              <div className="card-subtitle">
                View the result of the last broadcast attempt.
              </div>
            </div>
          </div>

          {result ? (
            <pre
              style={{
                fontSize: "0.8rem",
                background: "rgba(15,23,42,0.8)",
                padding: "0.75rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(148,163,184,0.35)",
                maxHeight: "360px",
                overflowY: "auto",
              }}
            >
{JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
              No broadcast executed yet. Send a notification to see status here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SendNotificationPage;
