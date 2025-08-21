const db = require('../queries/database');
const { createTournament } = require('../controllers/tournaments');
const { joinTournament } = require('../controllers/tournaments');

async function tournamentRoutes(fastify, options){
    //create a tournament
    fastify.post('/tournaments', async (request, reply) => {
        try{
            const { name, min_players, max_players } = request.body;
            const created_by = 3;
            const tournament = await createTournament(name, created_by, min_players, max_players);
            //use the message in createTournament and check
            return reply.code(200).send({message: 'Tournament created successfully', tournamentId: tournament.id});
        }
        catch(error){
            return reply.code(400).send({error: error.message});
        }
    });


    //get and delete tournaments (for debug)
    fastify.get('/tournaments', async () => {
        const tournaments = db.prepare('SELECT * FROM tournaments').all();
        return tournaments;
    });
    fastify.delete('/tournament-delete', async (request, reply) => {
        db.prepare('DELETE FROM tournaments').run();
        return { message: 'All tournaments deleted' };
    });

    //join a tournament
    fastify.post('/tournaments/:id/join', async (request, reply) => {
        try{
            const tournament_id = Number(request.params.id);
            //take the player_id from the auth user
            const { player_id } = request.body;
            if(!player_id){
                return reply.code(400).send({error: 'player_id is required'});
            }
            const join = await joinTournament(tournament_id, player_id);
            return reply.code(200).send(join);
        }
        catch(error){
            fastify.log.error("joining error:", error);
            return reply.code(400).send({error: error.message}); //debug
        }
    });
}

module.exports = tournamentRoutes;