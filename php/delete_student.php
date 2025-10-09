<?php
header('Content-Type: application/json');
include 'db_connect.php';

$response = ["status" => "error", "message" => "Invalid request"];

try {
    $input = json_decode(file_get_contents("php://input"), true);
    $id = $input['id'] ?? null;

    if ($id) {
        // Delete from attendance
        $stmt_att = $conn->prepare("DELETE FROM attendance WHERE student_id = ?");
        if ($stmt_att) {
            $stmt_att->bind_param("i", $id);
            $stmt_att->execute();
            $stmt_att->close();
        }

        // Delete from fees
        $stmt_fees = $conn->prepare("DELETE FROM fees WHERE student_id = ?");
        if ($stmt_fees) {
            $stmt_fees->bind_param("i", $id);
            $stmt_fees->execute();
            $stmt_fees->close();
        }

        // Delete from student_details
        $stmt = $conn->prepare("DELETE FROM student_details WHERE id = ?");
        if ($stmt) {
            $stmt->bind_param("i", $id);
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
        $response = ["status" => "error", "message" => "Missing student ID"];
    }
} catch (Exception $e) {
    $response = ["status" => "error", "message" => $e->getMessage()];
}

$conn->close();
echo json_encode($response);
?>
