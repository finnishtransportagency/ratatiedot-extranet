import { Link } from 'react-router-dom';
import logo from '../../assets/images/Logo_long.png';
import { Routes } from '../../constants/Routes';

export const Home = () => {
  return (
    <div>
      <header>
        <img src={logo} alt="logo" />
        <p>Sinua ei ole todennettu!</p>
      </header>
      <div>
        <Link to={Routes.LANDING}>Uusi sisäänkirjautuminen »</Link>
      </div>
    </div>
  );
};
