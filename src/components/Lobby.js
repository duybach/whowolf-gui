import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';

import Chat from './Chat';

import { setLobby } from '../actions';

const Lobby = ({ socket, lobby, dispatch }) => {
  const history = useHistory();
  const [playerReady, setPlayerReady] = useState(false);

  const setPlayerStatus = (status) => {
    setPlayerReady(status);
    socket.emit('lobby', lobby.id, 'PLAYER_READY', { status: status });
  };

  const kickPlayer = (playerId) => {
    socket.emit('lobby', lobby.id, 'KICK_PLAYER', { playerId: playerId });
  };

  const startGame = () => {
    if (Object.keys(lobby.players).length >= 4) {
      socket.emit('lobby', lobby.id, 'START_GAME');
    } else {
      alert('4 or more players are required to start the game.')
    }
  }

  const fetchLobby = useCallback(() => {
    socket.emit('lobbyStatus', lobby.id, (message) => {
      if ('error' in message) {
        console.log(message.error);
      } else {
        dispatch(setLobby(message));
      }

      socket.on('lobbyStatus', (message) => {
        dispatch(setLobby(message));
      });
    });
  }, [socket, dispatch, lobby.id]);

  useEffect(() => {
    if (lobby.status === 'GAME') {
      history.push(`/game/${lobby.id}`);
    }

    fetchLobby();
  }, [fetchLobby, history, lobby.status, lobby.id]);

  return (
    <Container>
      <Row>
        <Col>
          <h1>Lobby {lobby.id}</h1>
          {lobby.players && lobby.hostId in lobby.players ? <h3>Host: {lobby.players[lobby.hostId].alias}</h3> : ''}

          <ListGroup>
            {
              Object.keys(lobby.players).map((id, index) => (
                <ListGroup.Item key={index} variant={lobby.players[id].status === 'PLAYER_READY' ? 'success' : ''}>
                  {lobby.players[id].alias} {socket.id === lobby.hostId ? <Button variant="danger" onClick={() => kickPlayer(id)}>X</Button> : ''}
                </ListGroup.Item>
              ))
            }
          </ListGroup>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button variant={playerReady ? 'danger' : 'primary'} onClick={() => setPlayerStatus(!(playerReady))}>{playerReady ? 'Not ready' : 'Ready'}</Button>
        </Col>
        <Col>
          {socket.id === lobby.hostId ? <Button variant={lobby.status === 'LOBBY_READY' ? 'primary' : 'danger'} onClick={() => startGame()}>Start</Button> : ''}
        </Col>
      </Row>

      <Row>
        <Chat />
      </Row>
    </Container>
  );
}

const mapStateToProps = (state) => ({
  socket: state.socket,
  lobby: state.lobby
})

export default connect(mapStateToProps)(Lobby);
