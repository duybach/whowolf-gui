const lobby = (state = {}, action) => {
  switch (action.type) {
    case 'SET_LOBBY_ID':
      return {
        ...state,
        id: action.lobbyId,
        players: {}
      };
    case 'SET_LOBBY':
      return action.lobby;
    default:
      return state;
  }
}

export default lobby;
