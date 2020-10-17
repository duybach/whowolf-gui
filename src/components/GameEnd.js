import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';

import Chat from './Chat';

import { setLobby } from '../actions';

const Game = ({ socket, lobby, dispatch }) => {
  const history = useHistory();

  const fetchLobby = useCallback(() => {
    socket.emit('lobbyStatus', lobby.id, (message) => {
      if ('error' in message) {
        console.log(message.error);
      } else {
        dispatch(setLobby(message));
      }
    });

    socket.on('lobbyStatus', (message) => {
      dispatch(setLobby(message));
    });
  }, [socket, dispatch, lobby.id]);


  const restartGame = () => {
    socket.emit('lobby', lobby.id, 'START_GAME');
  }

  useEffect(() => {
    if (lobby.status === 'GAME') {
      history.push(`/game/${lobby.id}`);
    } else if (lobby.status === 'LOBBY') {
      history.push(`/lobby/${lobby.id}`);
    } else if (lobby.status === 'EXIT') {
      dispatch(setLobby({}));
      history.push(``);
    }

    fetchLobby();

  }, [fetchLobby, history, lobby.id, lobby.status]);

  return (
    <Container>
      <Row>
        <Col>
          <h1>Game {lobby.id}</h1>
          <h3>Host: {lobby.hostId}</h3>
          <h3>Team won: {lobby.game.teamWon}</h3>

          <ListGroup>
            {
              Object.keys(lobby.players).map((playerId, index) => (
                <ListGroup.Item key={index} active={lobby.players[socket.id].targetPlayerId === playerId ? true : false}>
                  {lobby.players[playerId].alias} ({lobby.players[playerId].role} | {lobby.players[playerId].status})
                </ListGroup.Item>
              ))
            }
          </ListGroup>
        </Col>
      </Row>

      <Row>
        {socket.id === lobby.hostId ? <Button variant={lobby.status === 'GAME_END' ? 'primary' : 'danger'} onClick={() => restartGame()}>Restart</Button> : ''}
      </Row>

      <Row>
        <Chat />
      </Row>
    </Container>
  );
};

const mapStateToProps = (state) => ({
  socket: state.socket,
  lobby: state.lobby
});

export default connect(mapStateToProps)(Game);