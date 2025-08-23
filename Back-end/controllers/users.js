//ask the user to register with their information
//give the user previlidge to choose avatar/delete avatar
//check user input
//user can change username/change password
//here we are fetching the data
//fetch users from database
//get user by id will fetch the specific user's data depending on its id
// const getUserById = (userId, ())
//sql or query
//note (if(!username || !email || !password)) (if they are not provided) console.log(all fields required)
//authenticate users is a MUST for security
// In better-sqlite3, when you run a modifying query (like INSERT, UPDATE, or DELETE) using .run(), it returns an object with information about what happened. One of the properties is changes.

const db = require('../queries/database');
const bcrypt = require('bcrypt');
const multer = require('multer');

//insert a new user into the database
async function createUser(username, password, email, alias){

    //validate username input
    const MAX_USERNAME_LENGTH = 15;
    const MAX_NAME_LENGTH = 10;
    const MIN_PASSWORD_LENGTH = 6;
    //regular expression: It checks for something like name@example.com but doesn’t allow spaces, multiple @, or missing dots.
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(username.length > MAX_USERNAME_LENGTH){
        throw new Error(`Username cannot exceed ${MAX_USERNAME_LENGTH} characters`);
    }
    if(alias.length > MAX_NAME_LENGTH){
        throw new Error(`alias cannot exceed ${MAX_NAME_LENGTH} characters`);
    }
    //validate password input and password is not empty
    if(password.length < MIN_PASSWORD_LENGTH){
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    }

    if(email && !EMAIL_REGEX.test(email)){
        throw new Error('Invalid email format');
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`INSERT INTO users (username, password, email, alias) VALUES (?, ?, ?, ?)`);
    try{
        const sql = stmt.run(username, hashedPassword, email, alias);
        console.log('User Created Successfully!');
        console.log(sql); //debug
        return { id: sql.lastInsertRowid }; //returns the ID of the newly created user from sqlite
    }
    catch(error){
        console.error('SQL Error:', error); //debug
        if(error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === 'SQLITE_CONSTRAINT'){
            throw new Error('Username or email already exists');
        }
        throw error;
    }
};

async function userLogIn(username, password){
    //validate input
    if(!username || !password){
        throw new Error('All fields are required');
    }

    //search for user in database
    const stmt = db.prepare(`SELECT id, username, password FROM users WHERE username = ?`);
    const user = stmt.get(username); //for a single row
    if(!user){
        throw new Error('Invalid username or password');
    }

    //compare hashed password with the entered password
    const isMatched = await bcrypt.compare(password, user.password);
    if(!isMatched){
        throw new Error('invalid username or password');
    }
    //return user info
    return {userId: user.id, username: user.username};
}


async function deleteUserById(userId){
    //check if user about to be deleted exists
    const user = db.prepare(`SELECT id FROM users WHERE id = ?`).get(userId);
    if(!user){
        throw new Error('User not found');
    }

    //delete exisiting user by id
    db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
    return {message: `User with ID ${userId} has been deleted`};
}

//A logged-in player opening their own dashboard would call getUserdata().
//this is for authentcated users (who logged in and their token/session ID matches the requested profile ID)
//The userId should not come from the client. You should take it from the JWT/session of the logged-in user (so they can only see their own data).
//userId = authenticatedUserId, ID from auth (their own profile). / ID from session/JWT (your own profile).
async function getUserdata(userId){
    const fetchData = db.prepare('SELECT id, alias, username, email, avatar, player_matches, player_wins, created_at FROM users WHERE id = ?').get(userId);
    if(!fetchData){
        throw new Error(`User with ID ${userId} not found`);
    }
    
    const getGameHistory = db.prepare(`SELECT * FROM game_history WHERE user_id = ? ORDER BY played_at DESC`).all(userId);
    //db.prepare().all() always returns an array (even if empty). So this if will never trigger, unless there’s a DB error.
    if(!getGameHistory){
        throw new Error('Error fetching game history');
    }
    //return an object that contains user data and their game history
    return {user: fetchData, gameHistory: getGameHistory};
}



//Viewing another player’s profile in a match lobby or leaderboard would call getPublicProfile().
//this is for when users view other people's profiles: they will be allowed to view specific info excluding sensitive data
//ID from request (any profile). / ID from URL/request param (someone else’s profile).
async function getPublicProfile(targetUserId){ //or username
    const fetchData = db.prepare('SELECT username, alias, avatar, player_matches, player_wins, created_at FROM users WHERE id = ?').get(targetUserId);
    if(!fetchData){
        throw new Error(`User with ID ${targetUserId} not found`);
    }

    const getGameHistory = db.prepare(`SELECT * FROM game_history WHERE user_id = ? ORDER BY played_at DESC`).all(targetUserId);
    //db.prepare().all() always returns an array (even if empty). So this if will never trigger, unless there’s a DB error.
    if(!getGameHistory){
        throw new Error('Error fetching game history');
    }
    //return an object that contains user data and their game history
    return {user: fetchData, gameHistory: getGameHistory};
}


async function deleteUser(userId){
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    if (result.changes === 0){
        throw new Error('User not found');
    }
     // Optionally, confirm cascade worked (for debug/testing)
    const remainingGames = db.prepare('SELECT COUNT(*) AS count FROM game_history WHERE user_id = ?').get(userId);
    if (remainingGames.count > 0) {
        console.warn(`Warning: Some game history still exists for user ${userId}`);
    }
    return { message: "Account deleted successfully" };
}






/*
Validate file types.
Limit file sizes.
Sanitize filenames.
Store the image path in DB, not the image itself (unless small).
Handle uploads securely.
*/

// filename = '';
// async function uploadAvatar(userId, avatar){
//     const mystorage = multer.diskStorage({
//         destination: './uploads',
//         filename: (req, file, redirect) => {
//             let date = Date.now();
//             let fl = date + '.' + file.mimetype.split('/')[1];
//             (null, fl);
//             filename = fl;
//         }
//     })
    
//     const upload = multer({storage: mystorage});
//     if(!upload){
//         throw new Error('Error uploading Avatar');
//     }
// }

module.exports = {
    createUser,
    userLogIn,
    deleteUserById,
    getUserdata,
    getPublicProfile
    // uploadAvatar
};