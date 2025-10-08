<?php
header('Content-Type: application/json');
include 'db_connect.php';

$response = ["status" => "error", "message" => "Invalid request"];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $id = $_POST['id'] ?? '';
    $email = trim($_POST['email'] ?? '');
    $full_name = trim($_POST['full_name'] ?? '');
    $phone_number = trim($_POST['phone_number'] ?? '');
    $emergency_contact_name = trim($_POST['emergency_contact_name'] ?? '');
    $emergency_contact_number = trim($_POST['emergency_contact_number'] ?? '');
    $course_completed = trim($_POST['course_completed'] ?? '');

    if (strtolower($course_completed) === 'other' || $course_completed === '') {
        $course_completed = 'Other';
    }

    if ($id && $email && $full_name && $phone_number) {
        $stmt = $conn->prepare("
            UPDATE student_details 
            SET email = ?, full_name = ?, phone_number = ?, emergency_contact_name = ?, emergency_contact_number = ?, course_completed = ?
            WHERE id = ?
        ");

        if ($stmt) {
            $stmt->bind_param("ssssssi", $email, $full_name, $phone_number, $emergency_contact_name, $emergency_contact_number, $course_completed, $id);

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
?>
