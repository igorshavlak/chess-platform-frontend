// src/pages/RegistrationPage/RegistrationPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrationPage.css';

function RegistrationPage() {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        location: '',
        bio: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Нікнейм обов\'язковий.';
        if (!formData.firstName) newErrors.firstName = 'Ім\'я обов\'язкове.';
        if (!formData.lastName) newErrors.lastName = 'Прізвище обов\'язкове.';
        if (!formData.email) {
            newErrors.email = 'Email обов\'язковий.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Невірний формат email.';
        }
        if (!formData.password) {
            newErrors.password = 'Пароль обов\'язковий.';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль повинен бути не менше 6 символів.';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Паролі не співпадають.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const response = await fetch(`http://${import.meta.env.VITE_BACKEND_SERVER_IP}:8082/api/users/register`, { // Замініть на ваш реальний ендпоінт
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        password: formData.password,
                        bio: formData.bio,
                        locations: formData.location, // Відповідає полю 'locations' в CreateUserRequest
                        socialLinks: {}, // Можна додати логіку для збору соціальних посилань
                    }),
                });

                if (response.ok) {
                    setRegistrationSuccess(true);
                    setTimeout(() => {
                        navigate('/start'); // Перенаправлення на головну сторінку або сторінку входу
                    }, 2000);
                } else {
                    const errorData = await response.text();
                    setErrors({ general: errorData || 'Помилка реєстрації.' });
                }
            } catch (error) {
                setErrors({ general: 'Помилка мережі або сервера.' });
            }
        }
    };

    return (
        <div className="registration-page-container">
            <div className="registration-form-card">
                <h2>Реєстрація</h2>
                {registrationSuccess && (
                    <div className="success-message">
                        Реєстрація успішна! Ви будете перенаправлені...
                    </div>
                )}
                {errors.general && <div className="error-message">{errors.general}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Нікнейм</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={errors.username ? 'input-error' : ''}
                        />
                        {errors.username && <span className="error-text">{errors.username}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="firstName">Ім'я</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={errors.firstName ? 'input-error' : ''}
                        />
                        {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Прізвище</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={errors.lastName ? 'input-error' : ''}
                        />
                        {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Локація</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Біо</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Пошта</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={errors.password ? 'input-error' : ''}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Повтор пароля</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'input-error' : ''}
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="register-button">Зареєструватися</button>
                </form>
            </div>
        </div>
    );
}

export default RegistrationPage;