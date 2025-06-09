import axios from 'axios';

const API_BASE = `http://${import.meta.env.VITE_BACKEND_SERVER_IP}:8082`

export const enqueuePlayer = async (enqueueData, token) => {
  try {
    const response = await axios.post(`${API_BASE}/api/matchmaking/enqueue`, enqueueData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};