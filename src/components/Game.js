import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';

import Chat from './Chat';

import { setLobby } from '../actions';

const Game = ({ socket, lobby, dispatch }) => {
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

  useEffect(() => {
    fetchLobby();
  }, [fetchLobby]);

  return (
    <Container>
      <Row>
        <Col>
          <h1>Game {lobby.id}</h1>
          <h3> Host: {lobby.hostId}</h3>

          <ListGroup>
            {
              Object.keys(lobby.players).map((id, index) => (
                <ListGroup.Item key={index}>
                  {lobby.players[id].alias}
                </ListGroup.Item>
              ))
            }
          </ListGroup>
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

export default connect(mapStateToProps)(Game);
