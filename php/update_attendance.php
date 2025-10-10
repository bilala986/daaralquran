<?php
header('Content-Type: application/json');
include 'db_connect.php';

$response = ["status" => "error", "message" => "Invalid request"];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $student_id = $_POST['student_id'] ?? null;
    $status = $_POST['status'] ?? null;
    $date = $_POST['date'] ?? null;

    if ($student_id && $status && $date) {
        $stmt = $conn->prepare("
            UPDATE attendance
            SET status = ?
            WHERE student_id = ? AND date = ?
        ");
        if ($stmt) {
            $stmt->bind_param("sis", $status, $student_id, $date);
            if ($stmt->execute()) {
                $response = ["status" => "success"];
            } else {
                $response = ["status" => "error", "message" => $stmt->error];
            }
            $stmt->close();
        } else {
            $response = ["status" => "error", "message" => $conn->error];
        }
    } else {
        $response = ["status" => "error", "message" => "Missing required fields"];
    }
}

$conn->close();
echo json_encode($response);
