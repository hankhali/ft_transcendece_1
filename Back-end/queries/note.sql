CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alias TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT,
    email TEXT,
    avatar TEXT,
    player_matches INTEGER DEFAULT 0,
    player_wins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- CREATE TABLE user_history (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,

-- );


CREATE TABLE tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    difficulty TEXT,
    user_score INTEGER NOT NULL,
    opponent_score INTEGER NOT NULL,
    result TEXT NOT NULL, /*win, lose, draw*/
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE matches (

)

CREATE TABLE friends (
    
)