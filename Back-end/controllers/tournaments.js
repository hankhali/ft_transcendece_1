/*
a tournament is not just one game → it’s a set of games between multiple players.
# create a tournament
- fields: name, maxPlayers, createdBy (authUserId).
- add default status = "pending".

# join tournament
- checks: not already full, not already joined.


#make user write a unique nickname when joining the tournament > done
#make sure same nickname cant exist per tournament (handle inside the code) > done
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
async function joinTournament(tournamentId, playerId, alias){
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
    //make sure player input a nickname
    if(!alias || alias.trim().length === 0){
        throw new Error('Nickname is required for this tournament');
    }
    //check if the nickname entered is already used/exists
    //select 1: because we dont want the database to return the entire row, we just want to check if the specfied data exists, if it does a 1 will be returned and if not the result will be null (nothing is returned)
    const isAliasExists = db.prepare('SELECT 1 FROM tournament_players WHERE tournament_id = ? AND tournament_alias = ?').get(tournamentId, alias);
    if(isAliasExists){
        throw new Error('This nickname is already taken in this tournament');
    }
    db.prepare('INSERT INTO tournament_players (tournament_id, player_id, tournament_alias, status) VALUES (?, ?, ?)').run(tournamentId, playerId, alias);
    return ({message: `Player ${playerId} has joined Tournament ${tournamentId} as ${alias}`});
}



//show players in a specific (id) tournament
async function getTournamentDetails(tournamentId){
    //check if tournament exist
    const checkTournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if(!checkTournament){
        throw new Error('Tournament not found');
    }
    
    //display players who joined this tournament
    const displayPlayers = db.prepare(`
        SELECT tournament_players.player_id, tournament_players.tournament_alias, users.username, users.avatar
        FROM tournament_players
        JOIN users ON tournament_players.player_id = users.id
        WHERE tournament_players.tournament_id = ?
        AND tournament_players.status = 'joined'`).all(tournamentId);
    return { checkTournament, displayPlayers };
}







module.exports = {
    createTournament,
    joinTournament,
    getTournamentDetails
};