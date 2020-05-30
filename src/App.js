import React from 'react';
import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router,
         Switch,
         Route
 } from 'react-router-dom';

import Home from './components/Home';
import CreateLobby from './components/CreateLobby';
import JoinLobby from './components/JoinLobby';
import Lobby from './components/Lobby';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/lobby/create">
          <CreateLobby />
        </Route>
        <Route path="/lobby/join">
          <JoinLobby />
        </Route>
        <Route path="/lobby">
          <Lobby />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
