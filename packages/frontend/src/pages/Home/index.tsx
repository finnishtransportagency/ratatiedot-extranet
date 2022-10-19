import logo from '../../assets/images/Logo_long.png';

export const Home = () => {
  return (
    <div>
      <header>
        <img src={logo} alt="logo" />
        <p>This is unstyled homepage (authentication will either redirect to here or to access-denied page)</p>
      </header>
    </div>
  );
};
