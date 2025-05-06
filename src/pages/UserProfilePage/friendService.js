const USE_MOCK = false
const API_BASE = 'http://localhost:8082'

// Мок-дані (фігурні для прикладу)
const mockFriends = [
  { id: 'u1', username: 'Гравець1', rating: 1720, online: true, lastSeen: '5 хвилин тому', avatar: null },
  { id: 'u2', username: 'Гравець2', rating: 1650, online: false, lastSeen: 'Вчора', avatar: null },
  { id: 'u3', username: 'Гравець3', rating: 1805, online: true, lastSeen: 'Зараз', avatar: null }
];
const mockRequests = [
  { id: 'r1', username: 'НовийДруг1', avatar: null },
  { id: 'r2', username: 'НовийДруг2', avatar: null }
];

function authHeader() {
  const token = window.keycloak?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listFriends(userId) {
  if (USE_MOCK) return Promise.resolve(mockFriends);
  const res = await fetch(`${API_BASE}/api/friends/listFriends?userId=${userId}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader() }
  });
  return res.json();
}

export async function listRequests(targetId) {
  if (USE_MOCK) return Promise.resolve(mockRequests);
  const res = await fetch(`${API_BASE}/api/friends/requests?targetId=${targetId}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader() }
  });
  return res.json();
}

export async function sendRequest(fromUserId, toUserId) {
  if (USE_MOCK) return Promise.resolve({ id: Date.now().toString(), username: 'Fake', avatar: null });
  const res = await fetch(`${API_BASE}/api/friends/sendRequest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ fromUserId, toUserId })
  });
  return res.json();
}

export async function acceptRequest(requestId) {
  if (USE_MOCK) return Promise.resolve();
  return fetch(`${API_BASE}/api/friends/requests/${requestId}/accept`, { method: 'POST', headers: authHeader() });
}

export async function rejectRequest(requestId) {
  if (USE_MOCK) return Promise.resolve();
  return fetch(`${API_BASE}/api/friends/requests/${requestId}/reject`, { method: 'POST', headers: authHeader() });
}

export async function removeFriend(userId, friendId) {
  if (USE_MOCK) return Promise.resolve();
  return fetch(`${API_BASE}/api/friends/delete/${userId}/${friendId}`, { method: 'DELETE', headers: authHeader() });
}
