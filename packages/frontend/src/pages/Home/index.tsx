import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/Logo_long.png';
import { Routes } from '../../constants/Routes';

export const Home = () => {
  const location = useLocation();
  return (
    <div>
      <header>
        <img src={logo} alt="logo" />
        <p>Sinua ei ole todennettu!</p>
      </header>
      {/* <div>
        <Link to="/paasy-kielletty" state={{ previousPath: location.pathname }}>
          Pääsy kieletty
        </Link>
      </div>
      <div>
        <Link to="not-found">Sivua ei löytynyt</Link>
      </div> */}
      <div>
        <Link to={Routes.LANDING}>Uusi sisäänkirjautuminen »</Link>
      </div>
    </div>
  );
};
