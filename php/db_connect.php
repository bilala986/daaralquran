<?php
$host = "localhost";      // usually 'localhost'
$user = "root";           // your phpMyAdmin username
$pass = "";               // your phpMyAdmin password (empty by default in XAMPP)
$db   = "daaralquran"; // change this to your actual DB name

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>