const Database = require('better-sqlite3');
const db = new Database('database.db');

async function createTables() {
  try {
    db.exec(`
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
      );
      
      CREATE TABLE IF NOT EXISTS game_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        opponent_id INTEGER NOT NULL,
        opponent_type TEXT NOT NULL,  /* 'AI' ou 'PLAYER' */
        difficulty TEXT,              /* null if opponent_type = 'PLAYER' */
        user_score INTEGER NOT NULL,
        opponent_score INTEGER NOT NULL,
        result TEXT NOT NULL, /* 'WIN', 'LOSS', 'DRAW' */
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (opponent_id) REFERENCES users (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        min_players INTEGER DEFAULT 2,
        max_players INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_by INTEGER NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS tournament_players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE (tournament_id, player_id)
      );
    `);
    //ON DELETE CASCADE: it will automatically remove all game history when a user is deleted
    console.log('Tables ensured');
  } catch (error) {
    console.error('Table setup failed:', error.message);
    process.exit(1);
  }
}

// Create tables immediately
createTables();

// Export db so other files can use it
module.exports = db;




























// try{
//     db.exec(`
//         CREATE TABLE IF NOT EXISTS users (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             alias TEXT NOT NULL,
//             username TEXT NOT NULL UNIQUE,
//             password TEXT,
//             email TEXT UNIQUE,
//             avatar TEXT,
//             player_matches INTEGER DEFAULT 0,
//             player_wins INTEGER DEFAULT 0,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         )
//     `);
//     console.log('Successfully connected to the users database');
// }
// catch(error){
//     console.error('Users database initialization failed', error.message);
//     process.exit(1);
// }

// module.exports = db;