import axios from 'axios';

const API_URL = 'http://localhost:8082/api/matchmaking';

export const enqueuePlayer = async (enqueueData, token) => {
  try {
    const response = await axios.post(`${API_URL}/enqueue`, enqueueData, {
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