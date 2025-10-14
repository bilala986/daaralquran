<?php
header('Content-Type: application/json');
include 'db_connect.php';

$class_name = $_GET['class_name'] ?? '';
$month = $_GET['month'] ?? '';
$year = isset($_GET['year']) ? (int)$_GET['year'] : date("Y");

if (!$class_name || !$month) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing class_name or month"]);
    $conn->close();
    exit;
}

$month = (int)$month;
$monthDate = "$year-" . str_pad($month, 2, "0", STR_PAD_LEFT) . "-01"; // ✅ "YYYY-MM-01"

$fees = [];

try {
    $sql = "
        SELECT f.student_id, s.full_name, f.status, f.amount
        FROM fees f
        JOIN student_details s ON f.student_id = s.id
        WHERE s.class_name = ?
          AND f.month = ?
          AND f.year = ?
        ORDER BY s.full_name
    ";

    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception($conn->error);
    $stmt->bind_param("ssi", $class_name, $monthDate, $year);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $fees[$row['student_id']] = $row['status'] ?? "Pending";
        $fees[$row['student_id'] . '_amount'] = $row['amount'] ?? 0;
    }

    $stmt->close();
    echo json_encode($fees, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
