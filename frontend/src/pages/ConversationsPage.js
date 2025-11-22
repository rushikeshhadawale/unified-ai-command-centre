import React, { useEffect, useState } from "react";
import { apiGet } from "../api";

function ConversationsPage() {
  const [conversations, setConversations] = useState([]);

  async function load() {
    try {
      const data = await apiGet("/conversations");
      setConversations(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function directionBadge(direction) {
    const cls =
      direction === "INBOUND" ? "badge badge--inbound" : "badge badge--outbound";
    return <span className={cls}>{direction.toLowerCase()}</span>;
  }

  function sentimentColor(sentiment) {
    switch (sentiment) {
      case "POSITIVE":
        return "#4ade80";
      case "NEGATIVE":
        return "#f97373";
      case "CONFUSED":
        return "#facc15";
      default:
        return "#e5e7eb";
    }
  }

  return (
    <div>
      <h1 className="page-title">Conversation Timeline</h1>
      <p className="page-subtitle">
        Unified view of all inbound and outbound messages with language, intent and sentiment.
      </p>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Messages</div>
            <div className="card-subtitle">
              Latest interactions across all users. Auto-refresh manually for demo.
            </div>
          </div>
          <button className="btn btn-ghost" onClick={load}>
            Refresh
          </button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Direction</th>
                <th>Channel</th>
                <th>Message</th>
                <th>Lang</th>
                <th>Intent</th>
                <th>Sentiment</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.user_id}</td>
                  <td>{directionBadge(c.direction)}</td>
                  <td>{c.channel}</td>
                  <td style={{ maxWidth: "260px" }}>
                    {c.message_text || (
                      <span style={{ color: "#9ca3af" }}>
                        (voice / no text)
                      </span>
                    )}
                  </td>
                  <td>{c.language}</td>
                  <td>
                    {c.intent_name ? (
                      <span className="badge">
                        {c.intent_name}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        border: "1px solid rgba(148,163,184,0.3)",
                        color: sentimentColor(c.sentiment),
                      }}
                    >
                      {c.sentiment}
                    </span>
                  </td>
                  <td>{new Date(c.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {conversations.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    No messages yet. Trigger a notification and send a webhook reply to see data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ConversationsPage;
