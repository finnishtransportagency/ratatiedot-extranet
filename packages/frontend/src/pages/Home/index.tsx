import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/Logo_long.png';

export const Home = () => {
  const location = useLocation();
  return (
    <div>
      <header>
        <img src={logo} alt="logo" />
        <p>This is unstyled homepage (authentication will either redirect to here or to access-denied page)</p>
      </header>
      <div>Try links:</div>
      <div>
        <Link to="/paasy-kielletty" state={{ previousPath: location.pathname }}>
          Pääsy kieletty
        </Link>
      </div>
      <div>
        <Link to="not-found">Sivua ei löytynyt</Link>
      </div>
    </div>
  );
};
