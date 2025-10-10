<?php
header('Content-Type: application/json');
include 'db_connect.php';

$students = [];

$sql = "SELECT id, email, full_name, phone_number, emergency_contact_name, emergency_contact_number, course_completed, class_name, date_added
        FROM student_details
        ORDER BY id DESC";

if ($result = $conn->query($sql)) {
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    $result->free();
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $conn->error]);
    $conn->close();
    exit;
}

$conn->close();
echo json_encode($students, JSON_PRETTY_PRINT);
?>
