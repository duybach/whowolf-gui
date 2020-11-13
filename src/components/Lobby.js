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
  const [hostAlias, setHostAlias] = useState('');

  const setPlayerStatus = (status) => {
    setPlayerReady(status);
    socket.emit('lobby', 'PLAYER_READY', { status: status });
  };

  const kickPlayer = (playerId) => {
    socket.emit('lobby', 'KICK_PLAYER', { playerId: playerId });
  };

  const startGame = () => {
    if (Object.keys(lobby.players).length >= 1) {
      socket.emit('lobby', 'START_GAME');
    } else {
      alert('4 or more players are required to start the game.')
    }
  }

  const fetchLobby = useCallback(() => {
    socket.emit('lobbyStatus', (message) => {
      if ('error' in message) {
        console.log(message.error);
      } else {
        dispatch(setLobby(message));

        setHostAlias(
          message.players.find((player) => {
            return player.id === socket.id;
          }).alias
        );
      }

      socket.on('lobbyStatus', (message) => {
        dispatch(setLobby(message));

        setHostAlias(
          message.players.find((player) => {
            return player.id === socket.id;
          }).alias
        );
      });
    });
  }, [socket, dispatch]);

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

          <h3>
            Host: {hostAlias}
          </h3>

          <ListGroup>
            {
              Object.keys(lobby.players).map((idx, index) => (
                <ListGroup.Item key={index} variant={lobby.players[idx].status === 'PLAYER_READY' ? 'success' : ''}>
                  {lobby.players[idx].alias} {socket.id === lobby.hostId ? <Button variant="danger" onClick={() => kickPlayer(idx)}>X</Button> : ''}
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
