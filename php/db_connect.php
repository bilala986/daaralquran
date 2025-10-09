<?php
$host = "localhost";
$user = "bilazqnw_daaralquran_user";
$pass = "Smash3cv4tc!";
$db   = "bilazqnw_daaralquran";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>