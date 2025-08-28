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

async function createTournament(name, created_by, max_players = 8){
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
    
    // Only allow 4 or 8 players
    if(max_players !== 4 && max_players !== 8){
        throw new Error('Tournament can only have 4 or 8 maximum players');
    }

    try{
        const stmt = db.prepare(`INSERT INTO tournaments (name, max_players, status, created_by)
            VALUES (?, ?, 'pending', ?)`);

        const result = stmt.run(name, max_players, created_by);
        console.log('Tournament Created Successfully! ID:', result.lastInsertRowid);
        return { 
            id: result.lastInsertRowid, 
            name: name, 
            max_players: max_players,
            status: 'pending',
            created_by: created_by
        };
    }
    catch(error){
        console.error('SQL Error:', error);
        throw error;
    }
}

//player join a specific tournament
async function joinTournament(tournamentId, playerAliases, userId){
    // Check if tournament exists
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if(!tournament){
        throw new Error('Tournament not found');
    }

    // Check if tournament is still pending
    if(tournament.status !== 'pending'){
        throw new Error('Tournament is not accepting new players');
    }

    // Validate aliases array
    if(!Array.isArray(playerAliases) || playerAliases.length === 0){
        throw new Error('Player aliases must be provided as an array');
    }

    // Check if we have the right number of aliases for this tournament
    if(playerAliases.length !== tournament.max_players){
        throw new Error(`Tournament requires exactly ${tournament.max_players} players`);
    }

    // Validate each alias
    playerAliases.forEach((alias, index) => {
        if(!alias || alias.trim().length === 0){
            throw new Error(`Player ${index + 1} alias is required`);
        }
        if(alias.length > 10){
            throw new Error(`Player ${index + 1} alias cannot exceed 10 characters`);
        }
    });

    // Check for duplicate aliases in the submission
    const uniqueAliases = new Set(playerAliases);
    if(uniqueAliases.size !== playerAliases.length){
        throw new Error('All player aliases must be unique');
    }

    // Check if tournament already has players
    const existingCount = db.prepare('SELECT COUNT(*) as total FROM tournament_players WHERE tournament_id = ?').get(tournamentId).total;
    if(existingCount > 0){
        throw new Error('Tournament already has players registered');
    }

    try{
        // Start transaction
        const insertStmt = db.prepare('INSERT INTO tournament_players (tournament_id, player_id, tournament_alias, status) VALUES (?, ?, ?, ?)');
        const updateTournamentStmt = db.prepare('UPDATE tournaments SET status = ? WHERE id = ?');

        // Insert all players
        playerAliases.forEach((alias, index) => {
            insertStmt.run(tournamentId, userId, alias, 'joined');
        });

        // Update tournament status to started since it's now full
        updateTournamentStmt.run('started', tournamentId);

        return {
            message: `Successfully registered ${playerAliases.length} players for tournament ${tournamentId}`,
            tournament_id: tournamentId,
            players: playerAliases,
            status: 'started'
        };
    }
    catch(error){
        console.error('SQL Error:', error);
        throw error;
    }
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

async function leaveTournament(tournamentId, playerId){
    //check if tournament exist
    const checkTournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if(!checkTournament){
        throw new Error('Tournament not found');
    }

    //before leaving, you should check if the player who wants to leave is in the tournament or not
    const isPlayerExists = db.prepare('SELECT * FROM tournament_players WHERE tournament_id = ? AND player_id = ?').get(tournamentId, playerId);
    if(!isPlayerExists){
        throw new Error('Player not found in this tournament');
    }

    //players cant leave tournament if it already started (i will leave it for now)
    if (checkTournament.status === 'started') {
        throw new Error('Cannot leave a tournament that has already started');
    }

    //decide whether you want to delete the player and their history permanently or what (soft deletion for now)
    //mark player as left
    db.prepare(`UPDATE tournament_players SET status = 'left' WHERE tournament_id = ? AND player_id = ?`).run(tournamentId, playerId);
    return { message: `Player ${playerId} has left Tournament ${tournamentId}` };
}





module.exports = {
    createTournament,
    joinTournament,
    getTournamentDetails,
    leaveTournament
};
