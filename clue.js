function getTeamFromMember(member) {
    return member.team;
  }
  
  // Helper function to get the starting clue for a team
  function getStartingClueForTeam(team) {
    // Here you would need to have some way of storing the starting clue for each team
    // One way to do this would be to store it as a property on the team object
    // Then you could retrieve that property here to get the starting clue
    return team.startingClue;
  }

  module.exports = {
      getTeamFromMember,
      getStartingClueForTeam,
  };