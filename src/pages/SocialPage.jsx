import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import { 
  FaUserFriends, 
  FaUsers, 
  FaComments, 
  FaGlobe, 
  FaNewspaper, 
  FaGraduationCap 
} from 'react-icons/fa';
import './SocialPage.css';

const SocialPage = () => {
  const socialFeatures = [
    {
      id: 'friends',
      title: 'Друзі',
      icon: <FaUserFriends className="feature-icon" />,
      description: 'Знайдіть та додайте друзів',
      color: '#F5D6A7',
      link: '/friends'
    },
    {
      id: 'clubs',
      title: 'Клуби',
      icon: <FaUsers className="feature-icon" />,
      description: 'Приєднуйтесь та змагайтесь у клубах',
      color: '#4A7C59',
      link: '/clubs'
    },
    {
      id: 'forums',
      title: 'Форуми',
      icon: <FaComments className="feature-icon" />,
      description: 'Знайдіть відповіді від спільноти',
      color: '#1D7D81',
      link: '/forums'
    },
    {
      id: 'members',
      title: 'Учасники',
      icon: <FaGlobe className="feature-icon" />,
      description: 'Шукайте та знаходьте гравців по всьому світу',
      color: '#3A5683',
      link: '/members'
    },
    {
      id: 'blogs',
      title: 'Блоги',
      icon: <FaNewspaper className="feature-icon" />,
      description: 'Читайте та вдосконалюйтеся у своїй шаховій подорожі',
      color: '#F2BD3D',
      link: '/blogs'
    },
    {
      id: 'coaches',
      title: 'Тренери',
      icon: <FaGraduationCap className="feature-icon" />,
      description: 'Знайдіть тренера, який допоможе вам покращити навички',
      color: '#5B7AA9',
      link: '/coaches'
    }
  ];

  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <header className="social-header">
          <h1>Соціальні функції</h1>
          <p>Спілкуйтеся, покращуйте навички та станьте частиною шахової спільноти</p>
        </header>

        <div className="social-features-grid">
          {socialFeatures.map((feature) => (
            <Link to={feature.link} key={feature.id} className="social-feature-card" style={{ backgroundColor: feature.color }}>
              <div className="feature-icon-container">
                {feature.icon}
              </div>
              <div className="feature-content">
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialPage;