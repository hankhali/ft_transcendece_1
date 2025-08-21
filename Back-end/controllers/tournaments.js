/*
a tournament is not just one game → it’s a set of games between multiple players.
# create a tournament
- fields: name, maxPlayers, createdBy (authUserId).
- add default status = "pending".

# join tournament
- checks: not already full, not already joined.
*/
const db = require('../queries/database');

async function createTournament(name, created_by = null, min_players = 2, max_players = 8){
    //name the tournament
    const MIN_NAME_LENGTH = 3;
   
    if(!name){
        throw new Error('Tournament name is required');
    }
    if(typeof name !== 'string' || name.length < MIN_NAME_LENGTH){
        throw new Error(`Tournament name must be a string with at least ${MIN_NAME_LENGTH} characters`);
    }
    if(!created_by){
        throw new Error('Creator ID is required');
    }
    if(min_players > max_players){
        throw new Error('Minimun players cannot exceed maximum players');
    }


    try{
        const stmt = db.prepare(`INSERT INTO tournaments (name, min_players, max_players, status, created_by)
            VALUES (?, ?, ?, 'pending', ?)`);

        const result = stmt.run(name, min_players, max_players, created_by);
        console.log('Tournament Created Successfully!ID:', result.lastInsertRowid);
        return { id: result.lastInsertRowid };
    }
    catch(error){
        console.error('SQL Error:', error); //debug
        throw error;
    }
}

//player join a specific tournament
async function joinTournament(tournamentId, playerId){
    //make sure the tournament exists
    const checkTournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if(!checkTournament){
        throw new Error('Tournament not found');
    }
    //make sure this player isnt joining the tournament for the second time
    const checkPlayer = db.prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND player_id = ?').get(tournamentId, playerId);
    if(checkPlayer){
        throw new Error('Player already joined this tournament');
    }
    //make sure the tournament didnt exceed the limits of max players
    //count how many players have already joined the tournament
    const count = db.prepare('SELECT COUNT(*) as total FROM tournament_players WHERE tournament_id = ?').get(tournamentId).total;
    if(count >= checkTournament.max_players){
        throw new Error('This tournament is full');
    }
    db.prepare('INSERT INTO tournament_players (tournament_id, player_id) VALUES (?, ?)').run(tournamentId, playerId);
    return ({message: `Player ${playerId} has joined Tournament ${tournamentId}`});
}

module.exports = {
    createTournament,
    joinTournament
};