const API_BASE = "http://localhost:8000";

export async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function apiPost(path, data) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}
