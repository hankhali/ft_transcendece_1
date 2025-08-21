const fastify = require('fastify')({logger: true})

const db = require('./queries/database');

fastify.register(require('./routes/users'));
fastify.register(require('./routes/tournaments'));

const PORT = 5000;
const start = async () => {
    try {
        await fastify.listen({port: PORT, host: '0.0.0.0'})
    }
    catch(error){
        fastify.log.error(error);
        process.exit(1);
    }
};

start();