<?php
header('Content-Type: application/json');
include 'db_connect.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $student_id = isset($_POST['student_id']) ? (int) $_POST['student_id'] : 0;
        $status = isset($_POST['status']) ? trim($_POST['status']) : '';
        $amount = isset($_POST['amount']) ? (float) $_POST['amount'] : 0;
        $month = isset($_POST['month']) ? (int) $_POST['month'] : 0;
        $year = isset($_POST['year']) ? (int)$_POST['year'] : date("Y");

        if (!$student_id || !$status || !$month) {
            echo json_encode(["status"=>"error","message"=>"Missing required fields"]);
            $conn->close();
            exit;
        }

        $monthDate = "$year-" . str_pad($month, 2, "0", STR_PAD_LEFT) . "-01"; // ✅ "YYYY-MM-01"

        // ✅ Check if record exists for this student + month + year
        $stmt = $conn->prepare("SELECT id FROM fees WHERE student_id = ? AND month = ? AND year = ?");
        $stmt->bind_param("isi", $student_id, $monthDate, $year);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();
        $stmt->close();

        if ($row) {
            // ✅ Update existing
            $stmt = $conn->prepare("UPDATE fees SET status=?, amount=? WHERE id=?");
            $stmt->bind_param("sdi", $status, $amount, $row['id']);
            $stmt->execute();
            $stmt->close();
        } else {
            // ✅ Insert new
            $stmt = $conn->prepare("INSERT INTO fees (student_id, amount, status, month, year) VALUES (?,?,?,?,?)");
            $stmt->bind_param("idssi", $student_id, $amount, $status, $monthDate, $year);
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
