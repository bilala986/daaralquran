<?php
header('Content-Type: application/json');
include 'db_connect.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $student_id = isset($_POST['student_id']) ? (int) $_POST['student_id'] : 0;
        $status = isset($_POST['status']) ? trim($_POST['status']) : '';
        $amount = isset($_POST['amount']) ? (float) $_POST['amount'] : 0;
        $month = isset($_POST['month']) ? (int) $_POST['month'] : 0;

        if (!$student_id || !$status || !$month) {
            echo json_encode(["status"=>"error","message"=>"Missing required fields"]);
            $conn->close();
            exit;
        }

        $year = date("Y"); // current year
        $monthDate = "$year-" . str_pad($month, 2, "0", STR_PAD_LEFT) . "-01"; // YYYY-MM-01

        // Check if a fee record exists
        $stmt = $conn->prepare("SELECT id FROM fees WHERE student_id = ? AND month = ?");
        $stmt->bind_param("is", $student_id, $monthDate);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        $stmt->close();

        if ($row) {
            // Update existing record
            $stmt = $conn->prepare("UPDATE fees SET status=?, amount=? WHERE id=?");
            $stmt->bind_param("sdi", $status, $amount, $row['id']);
            $stmt->execute();
            $stmt->close();
        } else {
            // Insert new record
            $stmt = $conn->prepare("INSERT INTO fees (student_id, amount, status, month) VALUES (?,?,?,?)");
            $stmt->bind_param("idss", $student_id, $amount, $status, $monthDate);
            $stmt->execute();
            $stmt->close();
        }

        echo json_encode(["status"=>"success"]);
    } else {
        echo json_encode(["status"=>"error","message"=>"Invalid request"]);
    }
} catch (Exception $e) {
    echo json_encode(["status"=>"error","message"=>$e->getMessage()]);
}

$conn->close();
