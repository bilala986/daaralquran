<?php
header('Content-Type: application/json');
include 'db_connect.php';

$response = ["status" => "error", "message" => "Invalid request"];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $student_id = isset($_POST['student_id']) ? (int) $_POST['student_id'] : 0;
        $status = isset($_POST['status']) ? trim($_POST['status']) : null; // "Present" or "Absent"
        $date = isset($_POST['date']) ? trim($_POST['date']) : null;

        if (!$student_id || !$date || !$status) {
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            $conn->close();
            exit;
        }

        // Check if attendance row exists for this student + date
        $stmt = $conn->prepare("SELECT id FROM attendance WHERE student_id = ? AND date = ?");
        if (!$stmt) {
            echo json_encode(["status" => "error", "message" => $conn->error]);
            $conn->close();
            exit;
        }
        $stmt->bind_param("is", $student_id, $date);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        $stmt->close();

        if ($row) {
            // Update
            $stmt = $conn->prepare("UPDATE attendance SET status = ? WHERE id = ?");
            if (!$stmt) {
                echo json_encode(["status" => "error", "message" => $conn->error]);
                $conn->close();
                exit;
            }
            $stmt->bind_param("si", $status, $row['id']);
            if ($stmt->execute()) {
                echo json_encode(["status" => "success"]);
            } else {
                echo json_encode(["status" => "error", "message" => $stmt->error]);
            }
            $stmt->close();
        } else {
            // Insert new
            $stmt = $conn->prepare("INSERT INTO attendance (student_id, status, date) VALUES (?, ?, ?)");
            if (!$stmt) {
                echo json_encode(["status" => "error", "message" => $conn->error]);
                $conn->close();
                exit;
            }
            $stmt->bind_param("iss", $student_id, $status, $date);
            if ($stmt->execute()) {
                echo json_encode(["status" => "success"]);
            } else {
                echo json_encode(["status" => "error", "message" => $stmt->error]);
            }
            $stmt->close();
        }
    } else {
        echo json_encode($response);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
