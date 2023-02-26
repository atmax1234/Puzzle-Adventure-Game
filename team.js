const teams = {};

function createTeam(teamName, captain, captainName) {
    // Check if team name provided
    if (!teamName) {
      return "Please enter a team name.";
    }
  
    // Check if team name already exists
    if (teams[teamName]) {
      return "Team name already taken. Please choose another name.";
    }
  
    // Create new team with captain
    teams[teamName] = [captain];
    captain.team = teamName;
  
    // // Verify that captain has been assigned to the team
    // console.log(captain.team);
  
    return `Team ${teamName} created. ${captainName} is the captain.`;
  }

function joinTeam(teamName, player, member) {
  // Check if team exists
  if (!teams[teamName]) {
    return "Team does not exist. Please enter a valid team name.";
  }

  // Add player to team
  teams[teamName].push(player);
  member.team = teamName;
  return `${player} has joined team ${teamName}.`;
}

function joinLobby(channel, player) {
  // Add player to channel
  channel.join(player);

  return `${player} has joined the lobby.`;
}

function leaveTeam(player) {
  // Check if player is in a team
  if (!player.team) {
    return `${player.username} is not on a team.`;
  }

  const teamName = player.team;
  const team = teams[teamName];
  const playerIndex = team.indexOf(player);

  // Remove player from team
  if (playerIndex !== -1) {
    team.splice(playerIndex, 1);
    player.team = null;
    return `${player.username} has left team ${teamName}.`;
  }
}

module.exports = {
  createTeam,
  joinTeam,
  joinLobby,
  leaveTeam,
  teams,
};
