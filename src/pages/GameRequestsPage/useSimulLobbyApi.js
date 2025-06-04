// src/hooks/useSimulLobbyApi.js
import { useState, useEffect, useContext, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { WSSContext } from '../../App';

const API_BASE_URL = `http://${import.meta.env.BACKEND_SERVER_IP}:8082/api/games/simul`;

function useSimulLobbyApi() {
    const { keycloak, initialized } = useKeycloak();
    const { service: websocketService, connected: wsConnected } = useContext(WSSContext);

    const [simulSessions, setSimulSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Fetch Simul Sessions ---
    useEffect(() => {
        if (!initialized || !keycloak.authenticated) {
            // Не завантажуємо дані, якщо Keycloak не ініціалізовано або користувач не автентифікований
            setLoading(false);
            return;
        }

        const fetchSimulLobbies = async () => {
            setLoading(true);
            setError(null); // Скидаємо попередні помилки
            try {
                const response = await fetch(`${API_BASE_URL}/lobby/getLobbies`, {
                    method: 'POST', // Відповідно до бекенду
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${keycloak.token}`,
                    },
                    // Запит POST без тіла, відповідно до вашого бекенд коду
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Error fetching simul lobbies: ${response.status}`, errorText);
                    throw new Error(`Не вдалося завантажити сеанси: ${response.status}`);
                }

                const data = await response.json();
                setSimulSessions(data);
                console.log("Fetched Simul Lobbies:", data);

            } catch (err) {
                setError(err);
                console.error('Failed to fetch simul lobbies:', err);
                setSimulSessions([]); // Очищаємо дані при помилці
            } finally {
                setLoading(false);
            }
        };

        fetchSimulLobbies();

        // Dependency array: перезапускаємо ефект, якщо стан Keycloak або токен змінився
    }, [initialized, keycloak.authenticated, keycloak.token]);

    // --- WebSocket Subscription for New Simul Sessions ---
    useEffect(() => {
        // Підписуємося тільки якщо WS сервіс доступний і користувач автентифікований
        if (!websocketService || !initialized || !keycloak.authenticated || !wsConnected) {
            console.log("WS Service not ready or not authenticated for simul lobby topic.");
            return;
        }

        console.log('Subscribing to /topic/simul/simulLobby');
        // Підписуємося на тему
        const unsubscribe = websocketService.subscribe('/topic/simul/simulLobby', (newSession) => {
            console.log('Received new simul session via WS:', newSession);
            // Додаємо новий сеанс до стану, перевіряючи на дублікати
            setSimulSessions(prevSessions => {
                if (prevSessions.some(session => session.simulId === newSession.simulId)) {
                    return prevSessions;
                }
                return [...prevSessions, newSession];
            });
        });

        // Повертаємо функцію відписки для очищення при демонтажі компонента
        return () => {
            console.log('Unsubscribing from /topic/simul/simulLobby');
            unsubscribe();
        };

        // Dependency array: перезапускаємо ефект, якщо WS сервіс або стан автентифікації змінився
    },  [websocketService, initialized, keycloak.authenticated, wsConnected]);




    const joinSimul = useCallback(async (lobbyId) => {
        const playerId = keycloak.tokenParsed?.sub;
        if (!playerId) throw new Error("User ID not available");

        try {
            const response = await fetch(`${API_BASE_URL}/lobby/${lobbyId}/join?playerId=${playerId}`, {
                method: 'POST',
                body: null
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Error joining simul: ${response.status}`, errorBody);
                throw new Error(`Помилка приєднання до сеансу: ${response.status} ${errorBody}`);
            }

            console.log(`Successfully joined simul lobby ${lobbyId}`);
            return { success: true };
        } catch (err) {
            console.error('Failed to join simul:', err);
            throw err;
        }
    }, [keycloak]);




    // --- Create Simul Function ---
    // Ця функція буде викликатися з компонента GameRequestsPage
    const createSimul = async (simulDataFromModal) => {
        if (!keycloak.authenticated || !keycloak.token) {
            console.error("Cannot create simul: User not authenticated");
            throw new Error("Користувач не автентифікований.");
        }

        const masterId = keycloak.tokenParsed?.sub;

        if (!masterId) {
            console.error("Cannot create simul: User ID not found in token");
            throw new Error("Не вдалося отримати ідентифікатор користувача.");
        }
        const startTimeValue = simulDataFromModal.startTime; // Це рядок з інпута ("YYYY-MM-DDTHH:mm")
        let backendStartTime = null;

        if (startTimeValue) { // Перевірка, чи рядок не порожній
            const dateObj = new Date(startTimeValue);
            console.log("Attempting to parse startTime string:", startTimeValue, "Resulting Date object:", dateObj); // ЛОГ 1: Що отримано і що вийшло

            if (!isNaN(dateObj.getTime())) { // Перевірка, чи об'єкт Date валідний
                backendStartTime = dateObj.toISOString(); // Конвертація!
                console.log("Valid Date parsed, ISO string:", backendStartTime); // ЛОГ 2: Що буде відправлено
            } else {
                console.error("Failed to parse startTime string into a valid Date:", startTimeValue); // ЛОГ 3: Помилка парсингу на фронтенді
                throw new Error("Некоректний формат часу початку."); // Зупиняємо запит, якщо парсинг невдався
            }
        } else {
            console.log("startTimeValue is empty or null, sending null to backend."); // ЛОГ 4: Поле пусте
            // Якщо бекенд вимагає час, то тут теж треба викинути помилку:
            // throw new Error("Час початку є обов'язковим.");
        }

        // Construct the request body matching CreateSimulRequestDTO
        const requestBody = {
            masterId: masterId,
            playerColor: simulDataFromModal.playerColor,
            maxOpponents: simulDataFromModal.maxOpponents,
            timeControl: simulDataFromModal.timeControl,
            gameMode: simulDataFromModal.gameMode,
            additionalMasterTime: simulDataFromModal.additionalMasterTime,
            minRating: simulDataFromModal.minRating,
            rating: simulDataFromModal.rating,
            startTime: backendStartTime, // Use the converted/validated time
        };

        console.log("Sending request body to create simul:", requestBody);

        try {
            const response = await fetch(`${API_BASE_URL}/createLobby`, { // Adjust URL if needed
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${keycloak.token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Error creating simul: ${response.status}`, errorBody);
                throw new Error(`Помилка створення сеансу: ${response.status} ${errorBody}`); // Викидаємо помилку для обробки в компоненті
            }

            const simulId = await response.json(); // Backend returns UUID
            console.log("Simul session created successfully! ID:", simulId);

            // Успіх. Новий сеанс з'явиться через WebSocket.
            // Можна повернути ID або статус успіху.
            return { success: true, simulId: simulId };

        } catch (err) {
            console.error('Failed to create simul:', err);
            // Викидаємо помилку далі, щоб компонент, що викликав, міг її обробити (наприклад, показати користувачеві)
            throw err;
        }
    };


    // Хук повертає стан та функції, які потрібні компоненту GameRequestsPage
    return {
        simulSessions,
        loading,
        error,
        createSimul,
        joinSimul // Повертаємо функцію для створення сеансу
        // Можливо, знадобляться інші функції, наприклад, для приєднання до сеансу
        // joinSimul: async (simulId) => { ... }
    };
}

export default useSimulLobbyApi;