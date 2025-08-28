//schema input validations
//all fiels are required (username, password, nickname)
//passowrd length > 5
//check email input

// /register is where the user will input their information
const { createUser } = require('../controllers/users');
const { userLogIn } = require('../controllers/users');
const { deleteUserById } = require('../controllers/users');
const { getUserdata } = require('../controllers/users');
const { getPublicProfile } = require('../controllers/users');
const { setUserAlias } = require('../controllers/users');
const db = require('../queries/database');



async function userRoutes(fastify, options){
    fastify.post('/register', async (request, reply) => {
        try{
            const { username, password, email } = request.body;
            if(!username || !password || !email){
                return reply.code(400).send({error: 'Username, password, and email are required!'});
            }
            const newUser = await createUser(username, password, email);
            return reply.code(200).send({
                message: 'User registered successfully', 
                userId: newUser.id
            });
        }
        catch(error){
            fastify.log.error("Registration error:", error);
            return reply.code(500).send({error: error.message});
        }
    });

    //route for setting alias
    fastify.post('/set-alias', async (request, reply) => {
        try{
            const { userId, alias } = request.body;
            if(!userId || !alias){
                return reply.code(400).send({error: 'User ID and alias are required!'});
            }
            const result = await setUserAlias(userId, alias);
            return reply.code(200).send(result);
        }
        catch(error){
            fastify.log.error("Set alias error:", error);
            return reply.code(500).send({error: error.message});
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
            return reply.code(400).send({error: error.message});
        }
    });

    // //log out
    // fastify.post('/logout', async (request, reply) => {

    // })

    // //upload avatar
    // fastify.post('/upload', async (request, reply) => {
    //     reply.send('Successfully uploaded Avatar');
    // })


    //show registered users (maybe unnecessary)
    fastify.get('/users', async (request, reply) => {
        try{
            const users = db.prepare(`
                SELECT alias, username, avatar, player_matches, player_wins, created_at FROM users
                `).all();
            if(!users || users.length === 0){
                reply.code(404).send({error: 'No users found'});
            }
            return users;
        }
        catch(error){
            return reply.code(500).send({error: error.message});
        }
    });

    //fetch user public profile
    fastify.get('/users/:id', async (request, reply) => {
        try{
            const { id } = request.params;
            const data = await getPublicProfile(id);
            if(!data){
                return reply.code(404).send({ error: 'User not found' });
            }
            return reply.send(data);

        }
        catch(error){
            return reply.code(500).send({error: error.message});
        }
    });

    //fetch user own profile
    fastify.get('/me', async (request, reply) => {
        try{
            //If you haven’t set up authentication yet, then request.user won’t exist. You’d need to first implement auth middleware to populate it.
            const id = request.user.id;
            const userData = await getUserdata(id);
            if(!userData){
                return reply.code(401).send({ error: "Unauthorized" });
            }
            return reply.send(userData); //whichi is better using return or reply and what is the difference?
        }
        catch(error){
            return reply.code(500).send({error: error.message});    
        }
    });


    //delete user's own profile
    fastify.delete('/me', async (request, reply) => {
        try{
            const authUserId  = request.user.id; //get from auth/session jwt
            const deletion = await deleteUser(authUserId );
            return reply.code(200).send(deletion);
        }
        catch(error){
            return reply.code(500).send({ error: error.message});
        }
    });


    //delete user by id (maybe unnecessary)
    fastify.delete('/users/:id', async (request, reply) => {
        try{
            const { id } = request.params;
            const userIdDeleted = await deleteUserById(id);
            reply.send(userIdDeleted);
        }
        catch(error){
            return reply.code(400).send({error: error.message});
        }
    });
}

module.exports = userRoutes;