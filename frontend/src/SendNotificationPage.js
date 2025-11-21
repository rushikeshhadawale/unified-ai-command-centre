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
    if (!form.template_id || selectedUsers.length === 0) return;

    let variablesObj = {};
    if (form.variables.trim()) {
      try {
        variablesObj = JSON.parse(form.variables);
      } catch (e) {
        alert("Variables must be valid JSON (e.g. {\"salary_amount\": 8000})");
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
      <h1>Send Notification</h1>
      <form
        onSubmit={handleSend}
        style={{ background: "white", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}
      >
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
          <label>Template</label><br />
          <select
            value={form.template_id}
            onChange={(e) => setForm({ ...form, template_id: e.target.value })}
          >
            <option value="">-- Select --</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.channel}, {t.language})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Variables (JSON)</label><br />
          <textarea
            rows={3}
            placeholder='{"salary_amount": 8000, "due_date": "30 Nov"}'
            value={form.variables}
            onChange={(e) => setForm({ ...form, variables: e.target.value })}
          />
        </div>

        <h3>Select Users</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {users.map((u) => (
            <label
              key={u.id}
              style={{
                background: selectedUsers.includes(u.id) ? "#4B5563" : "#E5E7EB",
                color: selectedUsers.includes(u.id) ? "white" : "black",
                padding: "0.25rem 0.5rem",
                borderRadius: "999px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selectedUsers.includes(u.id)}
                onChange={() => toggleUser(u.id)}
                style={{ marginRight: "4px" }}
              />
              {u.name} ({u.phone_number})
            </label>
          ))}
        </div>

        <button type="submit" style={{ marginTop: "0.5rem" }}>Send</button>
      </form>

      {result && (
        <div style={{ background: "white", padding: "1rem", borderRadius: "8px" }}>
          <h3>Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default SendNotificationPage;
