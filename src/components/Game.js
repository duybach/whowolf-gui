import React, { useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';

import Chat from './Chat';

import { setLobby, reduceLobbyGameTimeLeft } from '../actions';

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

  const pickPlayer = (playerId, action) => {
    socket.emit('game', lobby.id, action, { playerId: playerId });
  };

  const renderActionButtons = (playerId) => {
    if ((lobby.game.round === 0 && lobby.game.phase === 0 ) || lobby.players[socket.id].status !== 'PLAYER_ALIVE' || lobby.players[playerId].status !== 'PLAYER_ALIVE' || (lobby.game.phase === 1 && lobby.players[socket.id].role !== 'WERWOLF') || (lobby.game.phase === 2 && lobby.players[socket.id].role !== 'WITCH')) {
      return (<></>);
    }

    if (lobby.game.phase === 0) {
      return (
        <>
          {socket.id !== playerId ? <Button variant="danger" onClick={() => pickPlayer(playerId, 'PLAYER_VOTE')}>VOTE</Button> : ''}
        </>
      );
    } else if (lobby.game.phase === 1 && lobby.players[socket.id].role === 'WERWOLF') {
      return (
        <>
          {socket.id !== playerId ? <Button variant="danger" onClick={() => pickPlayer(playerId, 'PLAYER_KILL')}>KILL</Button> : ''}
        </>
      );
    } else if (lobby.game.phase === 2 && lobby.players[socket.id].role === 'WITCH' && lobby.game.werwolfTarget === playerId) {
      return (
        <>
          {socket.id !== playerId ? <Button variant="danger" onClick={() => pickPlayer(playerId, 'PLAYER_HEAL')}>HEAL</Button> : ''}
        </>
      );
    } else {
      return (<></>);
    }
  };

  const renderPhase = (phase) => {
    switch(phase) {
      case 0:
        return 'Voting Phase';
      case 1:
        return 'Werwolf Phase';
      case 2:
        return 'Healing Phase';
      default:
        return '';
    }
  }

  const tickTime = useCallback(() => {
    dispatch(reduceLobbyGameTimeLeft(1));
  }, [dispatch]);

  useEffect(() => {
    if (lobby.status === 'GAME_END') {
      history.push(`/game_end/${lobby.id}`);
    }

    fetchLobby();

    const lobbyIntervalId = setInterval(tickTime, 1000);

    return () => {
      clearInterval(lobbyIntervalId);
    };
  }, [fetchLobby, history, lobby.id, lobby.status, tickTime]);

  return (
    <Container>
      <Row>
        <Col>
          <h1>Game {lobby.id}</h1>
          <h3>Time: {lobby.game.phase === 0 ? 'day time' : 'night time'} ({renderPhase(lobby.game.phase)})</h3>
          <h3>Time left: {lobby.game.timeLeft}s</h3>
          {lobby.players[socket.id].role === 'WITCH' ? <h3>Heal left: {lobby.players[socket.id].healLeft}</h3> : ''}

          <ListGroup>
            {
              Object.keys(lobby.players).map((playerId, index) => (
                <ListGroup.Item key={index} active={lobby.players[socket.id].targetPlayerId === playerId ? true : false}>
                  {lobby.players[playerId].alias} (
                  {playerId === socket.id ? `${lobby.players[playerId].role} | ` : ''}
                  {lobby.players[playerId].status})
                  {renderActionButtons(playerId)}

                  {lobby.players[playerId].targetPlayerId ? `Voted for ${lobby.players[playerId].targetPlayerId}` : ''}
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
};

const mapStateToProps = (state) => ({
  socket: state.socket,
  lobby: state.lobby
});

export default connect(mapStateToProps)(Game);
