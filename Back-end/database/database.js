const Database = require('better-sqlite3');
const db = new Database('database.db');

try{
    const query = `
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT,
    email TEXT UNIQUE,
    avatar TEXT,
    player_matches INTEGER DEFAULT 0,
    player_wins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    db.exec(query); //execute without callback
    console.log('Successfully connected to the database');
}
catch(error){
    console.error('Database initialization failed', error.message);
    process.exit(1);
}
module.exports = db;