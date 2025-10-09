<?php
header('Content-Type: application/json');
include 'db_connect.php';

$response = ["status" => "error", "message" => "Invalid request"];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $student_id = $_POST['student_id'] ?? '';
    $status = $_POST['status'] ?? '';
    $date = $_POST['date'] ?? date('Y-m-d');

    if ($student_id && $status) {
        // Check if record exists
        $check = $conn->prepare("SELECT id FROM attendance WHERE student_id = ? AND date = ?");
        $check->bind_param("is", $student_id, $date);
        $check->execute();
        $check->store_result();

        if ($check->num_rows > 0) {
            // Update existing record
            $stmt = $conn->prepare("UPDATE attendance SET status = ? WHERE student_id = ? AND date = ?");
            $stmt->bind_param("sis", $status, $student_id, $date);
        } else {
            // Insert new record
            $stmt = $conn->prepare("INSERT INTO attendance (student_id, status, date) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $student_id, $status, $date);
        }

        if ($stmt->execute()) {
            $response = ["status" => "success"];
        } else {
            $response = ["status" => "error", "message" => $stmt->error];
        }

        $stmt->close();
        $check->close();
    } else {
        $response = ["status" => "error", "message" => "Missing student_id or status"];
    }
}

$conn->close();
echo json_encode($response);
?>
