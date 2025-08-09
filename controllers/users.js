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

const db = require('../database/database');
const bcrypt = require('bcrypt');

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
    
    const stmt = db.prepare(
        `INSERT INTO users (username, password, email, alias) VALUES (?, ?, ?, ?)`
    );
    try{
        const sql = stmt.run(username, hashedPassword, email, alias);
        console.log('User Created Successfully!');
        console.log(sql);
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

module.exports = {
    createUser,
    userLogIn
};
