// src/services/simulApi.js
import axios from 'axios';
import { useKeycloak } from '@react-keycloak/web';
import { useCallback } from 'react'; // Додано useCallback

// Базовий URL для контролера SimulLobbyController
const API_BASE_URL = `http://${import.meta.env.BACKEND_SERVER_IP}:8082/api/games/simul`; // Переконайтесь, що порт та шлях коректні


// Створюємо функцію-хук, яка повертає API функції з автоматичною авторизацією
export function useSimulApi() {
    const { keycloak, initialized } = useKeycloak();

    const getAuthConfig = useCallback(() => {
        if (!initialized || !keycloak.authenticated) {
            // Можна викинути помилку, або повернути null/undefined
            console.error("User not authenticated for API call");
            // Залежно від потреби, можна повертати Promise.reject
             return null; // Або викинути new Error("Not authenticated");
        }
        return {
            headers: {
                Authorization: `Bearer ${keycloak.token}`,
            },
        };
    }, [initialized, keycloak.authenticated, keycloak.token]); // Залежить від стану keycloak


    // Функція для отримання списку всіх активних симуляторів (використовується в GameRequestsPage)
    const getSimulLobbies = useCallback(async () => {
        const config = getAuthConfig();
        if (!config) throw new Error("Authentication required");
        try {
            // Згідно з бекендом, це POST запит без тіла
            const response = await axios.post(`${API_BASE_URL}/lobby/getLobbies`, null, config);
            return response.data; // Список SimulSessionDTO
        } catch (error) {
            console.error("Error fetching simul lobbies:", error);
            throw error; // Прокидаємо помилку далі для обробки в UI
        }
    }, [getAuthConfig]);


    // Функція для створення нового симулятора (використовується в GameRequestsPage)
    // Приймає дані, які відповідають CreateSimulRequestDTO (окрім masterId, який додається тут)
    const createSimul = useCallback(async (simulData) => {
        const config = getAuthConfig();
        if (!config) throw new Error("Authentication required");

        const masterId = keycloak.tokenParsed?.sub;
        if (!masterId) throw new Error("User ID not available");

        // Перетворення даних з модалки у формат DTO
        const requestBody = {
             masterId: masterId, // Додаємо masterId з Keycloak
             playerColor: simulData.playerColor,
             maxOpponents: simulData.maxOpponents,
             timeControl: simulData.timeControl,
             gameMode: simulData.gameMode, // Має бути назва ENUM, напр. "SIMUL"
             additionalMasterTime: simulData.additionalMasterTime,
             minRating: simulData.minRating,
             rating: simulData.rating,
             startTime: simulData.startTime, // Має бути ISO рядок або null
         };
        console.log("Sending CreateSimulRequestDTO:", requestBody); // Лог перед відправкою

        try {
            const response = await axios.post(`${API_BASE_URL}/createLobby`, requestBody, config);
            return response.data; // UUID створеного симулятора
        } catch (error) {
            console.error("Error creating simul:", error);
            // Можна отримати деталі помилки з error.response.data
            if (error.response && error.response.data) {
                console.error("Backend error details:", error.response.data);
                throw new Error(`Failed to create simul: ${error.response.status} - ${error.response.data.message || JSON.stringify(error.response.data)}`);
            } else {
                 throw new Error(`Failed to create simul: ${error.message}`);
            }
        }
    }, [getAuthConfig, keycloak]); // Залежить також від keycloak для userId


    // Функція для отримання деталей конкретного симулятора за ID
    const getSimulLobbyDetails = useCallback(async (lobbyId) => {
        const config = getAuthConfig();
         if (!config) throw new Error("Authentication required");
        try {
            const response = await axios.get(`${API_BASE_URL}/lobby/${lobbyId}`, config);
            return response.data; // SimulSessionDTO (детальний)
        } catch (error) {
             console.error(`Error fetching simul lobby ${lobbyId}:`, error);
             if (error.response && error.response.status === 404) {
                 //throw new Error("Simul lobby not found.");
             }
             //throw error;
        }
    }, [getAuthConfig]);


    // Функція для приєднання до симулятора
    // Бекенд очікує playerId як @RequestParam
    const joinSimulLobby = useCallback(async (lobbyId, playerId) => {
        const config = getAuthConfig();
         if (!config) throw new Error("Authentication required");
        try {
            // Відправляємо playerId як query parameter (params в Axios)
            const response = await axios.post(`${API_BASE_URL}/lobby/${lobbyId}/join`, null, {
                ...config,
                params: { playerId: playerId } // playerId як query parameter
            });
            return response.data; // Повертає Void (або що там бекенд повертає на успіх, build() зазвичай 200 OK без тіла)
        } catch (error) {
             console.error(`Error joining simul lobby ${lobbyId}:`, error);
             if (error.response && error.response.data) {
                  throw new Error(`Failed to join simul: ${error.response.status} - ${error.response.data.message || JSON.stringify(error.response.data)}`);
             } else {
                  throw new Error(`Failed to join simul: ${error.message}`);
             }
        }
    }, [getAuthConfig]);


    // Функція для відправки повідомлення в лоббі
    // Бекенд очікує playerId та message як @RequestParam
     const sendSimulLobbyMessage = useCallback(async (lobbyId, playerId, message) => {
         const config = getAuthConfig();
         if (!config) throw new Error("Authentication required");
         try {
             // Відправляємо playerId та message як query parameters
             const response = await axios.post(`${API_BASE_URL}/lobby/${lobbyId}/message`, null, {
                 ...config,
                 params: {
                     playerId: playerId,
                     message: message
                 }
             });
             return response.data; // Повертає String "Message was send"
         } catch (error) {
             console.error(`Error sending message in lobby ${lobbyId}:`, error);
             if (error.response && error.response.data) {
                  throw new Error(`Failed to send message: ${error.response.status} - ${error.response.data.message || JSON.stringify(error.response.data)}`);
             } else {
                  throw new Error(`Failed to send message: ${error.message}`);
             }
         }
     }, [getAuthConfig]);


    // Функція для підтвердження гравця (лише для Майстра)
    // Бекенд очікує playerId як @RequestParam
    const confirmSimulPlayer = useCallback(async (lobbyId, playerIdToConfirm) => {
        const config = getAuthConfig();
         if (!config) throw new Error("Authentication required");
        try {
            // Відправляємо playerIdToConfirm як query parameter
            const response = await axios.post(`${API_BASE_URL}/lobby/confirmSimulPlayer/${lobbyId}`, null, {
                ...config,
                params: { playerId: playerIdToConfirm } // playerId гравця, якого підтверджуємо
            });
            return response.data; // Повертає String "player was confirmed"
        } catch (error) {
             console.error(`Error confirming player ${playerIdToConfirm} in lobby ${lobbyId}:`, error);
              if (error.response && error.response.data) {
                  throw new Error(`Failed to confirm player: ${error.response.status} - ${error.response.data.message || JSON.stringify(error.response.data)}`);
             } else {
                  throw new Error(`Failed to confirm player: ${error.message}`);
             }
        }
    }, [getAuthConfig]);

    const startSimulSession = useCallback(async (lobbyId) => {
        const config = getAuthConfig();
        if (!config) throw new Error("Authentication required");

        try {
            // Викликаємо бекенд для старту сесії
            const response = await axios.post(
                `${API_BASE_URL}/lobby/${lobbyId}/start`,
                null, // Тіло запиту (якщо потрібно, додайте)
                config
            );
            return response.data; // Повертаємо SimulGamesDTO
        } catch (error) {
            console.error(`Error starting simul session:`, error);
            throw error;
        }
    }, [getAuthConfig]);


    // Хук повертає всі API функції
    return {
        getSimulLobbies,
        createSimul,
        getSimulLobbyDetails,
        joinSimulLobby,
        sendSimulLobbyMessage,
        confirmSimulPlayer,
        startSimulSession
        // removePlayerFromConfirms - не імплементовано на бекенді
    };
}

// Можливо, вам знадобиться також експортувати axios instance для інших потреб,
// або просто використовувати функції хука.
// export default axios; // Якщо потрібен сам екземпляр axios