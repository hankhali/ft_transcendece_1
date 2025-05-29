This is 25% of the manadotary part
#Requirements
* Backend Developer (PHP):
- Write PHP backend APIs: /register, /tournament
- Store aliases (flat file or SQLite)
- Add form input validation, hash passwords


✅ /register endpoint:

Accepts POST requests.

Validates username and password.

Prevents duplicates.

Hashes passwords.

Stores users in players.json.

Responds with proper HTTP status codes and JSON messages.



✅ /tournament endpoint:

Accepts POST requests.

Clears the players.json file.

Responds with correct status codes and messages.

✅ Uses pure PHP, no classes, which is valid for small APIs like this.
✅ Compatible with curl or Postman.

To Run:
#1
Start Apache via XAMPP

Place this project in htdocs/

Access via http://localhost/MyWebsite/backend/...

#2 
In terminal:
Example (Windows PowerShell or CMD)

*register
curl.exe -X POST http://localhost/MyWebsite/backend/register.php -d "username=example&password=123456"


*reset tournament
curl.exe -X POST http://localhost/MyWebsite/backend/tournament.php
