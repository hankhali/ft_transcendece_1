<?php
$storage = "players.json";

if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
    $username = filter_var(trim($_POST['username']), FILTER_SANITIZE_STRING);
    $password = filter_var(trim($_POST['password']), FILTER_SANITIZE_STRING);

    //validate input
    if(empty($username) || empty($password))
    {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Both fields are required!"]);
        exit;
    }
    if(!preg_match('/^[a-zA-Z0-9_]{4,20}$/', $username))
    {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Username must be 4-20 characters, alphanumeric or underscore only."]);
        exit;
    }

    //validate password

    if(strlen($password) < 6)
    {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters long."]);
        exit;
    }
    $encrypted_password = password_hash($password, PASSWORD_DEFAULT);
    $new_user = ["username" => $username, "password" => $encrypted_password];

    //checking JSON file
    if (file_exists($storage))
    {
        $json = file_get_contents($storage);
        $stored_users = json_decode($json, true);
        if(!is_array($stored_users))
        {
            $stored_users = [];
        }
    }

    //check duplicates
    foreach($stored_users as $user)
    {
        if($user['username'] == $username)
        {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Username already taken"]);
            exit;
        }
    }

    //add new user
    $stored_users[] = $new_user;
    if(file_put_contents($storage, json_encode($stored_users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)))
    {
        http_response_code(201);
        echo json_encode(["status" => "success", "message" => "Registration was successfull"]);
    }
    else{
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to register user"]);
    }

}
else{
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Only POST method is allowed"]);
}