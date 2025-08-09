//schema input validations
//all fiels are required (username, password, nickname)
//passowrd length > 5
//check email input

// /register is where the user will input their information
const { createUser } = require('../controllers/users');
const { userLogIn } = require('../controllers/users');
const db = require('../database/database');


async function userRoutes(fastify, options){
    fastify.post('/register', async (request, reply) => {
        try{
            const { username, password, email, alias } = request.body;
            if(!username || !password || !email || !alias){
                return reply.code(400).send({error: 'All fields are required!'});
            }
            const newUser = await createUser(username, password, email, alias);
            return reply.code(201).send({message: 'User registered successfully', userId: newUser.id});
        }
        catch(error){
            fastify.log.error("Registeration error:", error);
            return reply.code(500).send({error: error.message}); //debug
        }
    });

    //log in
    fastify.post('/login', async (request, reply) => {
        try{
            const { username, password } = request.body;
            const userData = await userLogIn(username, password);
            reply.send({message: 'Login successful', userId: userData.userId, username: userData.username}); //...userData
        }
        catch(error){
            reply.code(400).send({error: error.message});
        }
    });


    //show registered users
    fastify.get('/users', async (request, reply) => {
        try{
            const users = db.prepare(`
                SELECT id, alias, username, email, avatar, player_matches, player_wins, created_at FROM users
                `).all();
            if(!users || users.length === 0){
                reply.code(404).send({error: 'No users found'});
            }
            return users;
        }
        catch(error){
            reply.code(500).send({error: error.message});
        }
    });
}

module.exports = userRoutes;