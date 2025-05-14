// src/pages/ChessPuzzlePage.js
import React, { useEffect } from 'react'; // Додайте useEffect, якщо потрібно завантаження даних тут
import { useParams } from 'react-router-dom'; // Для читання параметра з URL
import Sidebar from '../../components/Sidebar/Sidebar';
import StandardPuzzleMode from './StandardPuzzleMode'; // Імпортуємо компонент стандартного режиму
import PuzzleStreakMode from './PuzzleStreakMode'; // Імпортуємо компонент стрік режиму

import './ChessPuzzlePage.css'; // Залиште стилі для загального макету сторінки


function ChessPuzzlePage() {
    // Читаємо параметр 'mode' з URL
    const { mode } = useParams();

    // Можна додати логіку для завантаження даних або фільтрації задач тут,
    // якщо ви хочете передавати лише потрібний набір задач в дочірні компоненти.
    // Наразі mockPuzzles імпортуються безпосередньо в компонентах режимів.
    // Це нормально для початку, але для масштабування краще завантажувати тут.
    // Приклад:
    // const [puzzlesData, setPuzzlesData] = useState([]);
    // useEffect(() => {
    //    // Завантажити або отримати потрібні задачі
    //    setPuzzlesData(loadedPuzzles);
    // }, [mode]); // Залежить від режиму, якщо задачі фільтруються


    let ModeComponent = null;
    let pageTitle = 'Шахова задача';

    // Визначаємо, який компонент рендерити залежно від параметра mode
    switch (mode) {
        case 'random':
            ModeComponent = <StandardPuzzleMode />;
            pageTitle = 'Випадкові задачі';
            break;
        case 'puzzle-streak':
            ModeComponent = <PuzzleStreakMode />;
            pageTitle = 'Puzzle Streak';
            break;
        // Додайте інші режими, якщо вони з'являться (наприклад, 'themed')
        // case 'themed':
        //    ModeComponent = <ThemedPuzzleMode theme={themeId} type={themeType} />; // Приклад
        //    pageTitle = 'Задачі за темою';
        //    break;
        default:
            // Режим не знайдено або не вказано
            // Можна показати повідомлення про помилку, перенаправити або показати режим за замовчуванням
            return (
                 <div className="app-container">
                    <Sidebar />
                    <div className="content-wrapper">
                        <div className="error-message">
                             <h2>Невідомий режим задач</h2>
                             <p>Будь ласка, виберіть режим на сторінці задач.</p>
                             {/* Можливо, додати кнопку для повернення на сторінку вибору режимів */}
                        </div>
                    </div>
                 </div>
            );
    }

    // Рендеримо загальний макет сторінки з бічною панеллю
    // і вставляємо вибраний компонент режиму в основний вміст
    return (
        <div className="app-container">
            <Sidebar />
            <div className="content-wrapper">
                 {/* Можливо, додати заголовок сторінки тут, над компонентом режиму */}
                 {/* <h1>{pageTitle}</h1> */}
                 {ModeComponent} {/* Рендеримо вибраний компонент режиму */}
            </div>
        </div>
    );
}

export default ChessPuzzlePage;