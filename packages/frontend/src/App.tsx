import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { IDataPayload } from 'server/src/types/data.type';

function App() {
  const [data, setData] = useState('');

  const connectBackend = async () => {
    const response = await fetch('http://localhost:8000');
    const data: IDataPayload = await response.json();
    setData(data.data);
  };

  useEffect(() => {
    connectBackend();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a className="App-link" href="http://localhost:8000" target="_blank" rel="noopener noreferrer">
          {data}
        </a>
      </header>
    </div>
  );
}

export default App;
