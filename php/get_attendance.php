<?php
header('Content-Type: application/json');
include 'db_connect.php';

$attendance = [];

$class_name = $_GET['class_name'] ?? '';
$date = $_GET['date'] ?? '';

if ($class_name && $date) {
    $sql = "
        SELECT a.id, a.student_id, s.full_name, a.status, a.date
        FROM attendance a
        JOIN student_details s ON a.student_id = s.id
        WHERE s.class_name = ? AND a.date = ?
        ORDER BY s.full_name
    ";
    
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("ss", $class_name, $date);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $attendance[] = $row;
        }
        $stmt->close();
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $conn->error]);
        $conn->close();
        exit;
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing class_name or date"]);
    $conn->close();
    exit;
}

$conn->close();
echo json_encode($attendance, JSON_PRETTY_PRINT);
