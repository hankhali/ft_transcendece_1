<?php
$storage = "players.json";

if ($_SERVER['REQUEST_METHOD'] == 'POST')
{
    if (file_put_contents($storage, json_encode([], JSON_PRETTY_PRINT)))
    {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Tournament reset successfully"]);
    }
    else{
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to reset tournament"]);
    }
}
else{
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "only POST method is allowed"]);
}