<?php
header('Content-Type: application/json');
include 'db_connect.php';

$date = $_GET['date'] ?? date('Y-m-d');

$stmt = $conn->prepare("SELECT student_id, status FROM attendance WHERE date = ?");
$stmt->bind_param("s", $date);
$stmt->execute();

$result = $stmt->get_result();
$attendance = $result->fetch_all(MYSQLI_ASSOC);

$stmt->close();
$conn->close();

echo json_encode($attendance);
?>
