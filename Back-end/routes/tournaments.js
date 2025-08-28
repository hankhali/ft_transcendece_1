// #list all tournaments
// #fetch one tournament and display the players inside this tournament

const db = require('../queries/database');
const { createTournament} = require('../controllers/tournaments');
const { joinTournament } = require('../controllers/tournaments');
const { getTournamentDetails } = require('../controllers/tournaments');
const { leaveTournament } = require('../controllers/tournaments');


async function tournamentRoutes(fastify, options){
    //create a tournament
    fastify.post('/tournaments', async (request, reply) => {
        try{
            const { name, max_players, created_by } = request.body;

            if(!name){
                return reply.code(400).send({error: 'Tournament name is required'});
            }
            
            if(max_players !== 4 && max_players !== 8){
                return reply.code(400).send({error: 'Tournament can only have 4 or 8 maximum players'});
            }

            const tournament = await createTournament(name, created_by, max_players);
            return reply.code(200).send({
                message: 'Tournament created successfully', 
                tournament: tournament
            });
        }
        catch(error){
            return reply.code(400).send({error: error.message});
        }
    });


    //delete tournaments (for debug)
    fastify.delete('/tournament-delete', async (request, reply) => {
        db.prepare('DELETE FROM tournaments').run();
        return { message: 'All tournaments deleted' };
    });

    //join a tournament
    fastify.post('/tournaments/:id/join', async (request, reply) => {
        try{
            const tournament_id = Number(request.params.id);
            const { playerAliases, userId } = request.body;
            
            if(!playerAliases || !userId){
                return reply.code(400).send({error: 'Player aliases and user ID are required'});
            }

            const result = await joinTournament(tournament_id, playerAliases, userId);
            return reply.code(200).send(result);
        }
        catch(error){
            fastify.log.error("Tournament join error:", error);
            return reply.code(400).send({error: error.message});
        }
    });

    //list all tournament
    fastify.get('/tournaments', async (request, reply) => {
        try{
            const tournamentsList = db.prepare('SELECT * FROM tournaments').all();
            if (!tournamentsList.length) {
                return reply.code(404).send({ message: "No tournaments found" });
            }
            return reply.code(200).send(tournamentsList);
        }
        catch(error){
            return reply.code(500).send({ error: error.message });
        }
    });


    //get a specific tournament and display all players who joined
    fastify.get('/tournaments/:id', async (request, reply) => {
        try{
            const id = Number(request.params.id);
            const displayDetails = await getTournamentDetails(id);
            if (!displayDetails) {
                return reply.code(404).send({ error: 'Tournament not found' });
            }
            return reply.code(200).send(displayDetails);
        }
        catch(error){
            return reply.code(404).send({ error: error.message });
        }
    });


    
    //leave a tournament
    fastify.delete('/tournaments/:id/leave', async (request, reply) => {
        try{
            //get tournament id
            //get the user from jwt who wants to leave
            const tournamentId = Number(request.params.id);
            const { player_id } = request.body;

            const leaveTrnmt = await leaveTournament(tournamentId, player_id);
            if(!leaveTrnmt){
                return reply.code(404).send({error});
            }
            return reply.code(200).send(leaveTrnmt);
        }
        catch(error){
            return reply.code(404).send({ error: error.message });
        }
    }); 
    
}


module.exports = tournamentRoutes;