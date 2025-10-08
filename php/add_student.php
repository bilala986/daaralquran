<?php
header('Content-Type: application/json');
include 'db_connect.php';

$response = ["status" => "error", "message" => "Invalid request"];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST['email'] ?? '');
    $full_name = trim($_POST['full_name'] ?? '');
    $phone_number = trim($_POST['phone_number'] ?? '');
    $emergency_contact_name = trim($_POST['emergency_contact_name'] ?? '');
    $emergency_contact_number = trim($_POST['emergency_contact_number'] ?? '');
    $course_completed = trim($_POST['course_completed'] ?? '');

    // If user chose "Other" but didn’t type a value — make it 'Other (unspecified)'
    if (strtolower($course_completed) === 'other' || $course_completed === '') {
        $course_completed = 'Other';
    }

    if ($email && $full_name && $phone_number) {
        $stmt = $conn->prepare("
            INSERT INTO student_details 
            (email, full_name, phone_number, emergency_contact_name, emergency_contact_number, course_completed)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        if ($stmt) {
            $stmt->bind_param("ssssss", $email, $full_name, $phone_number, $emergency_contact_name, $emergency_contact_number, $course_completed);

            if ($stmt->execute()) {
                $student_id = $stmt->insert_id;

                // Create related attendance + fees placeholders
                $stmt_att = $conn->prepare("INSERT INTO attendance (student_id, status) VALUES (?, NULL)");
                if ($stmt_att) {
                    $stmt_att->bind_param("i", $student_id);
                    $stmt_att->execute();
                    $stmt_att->close();
                }

                $stmt_fees = $conn->prepare("INSERT INTO fees (student_id, amount, status) VALUES (?, NULL, NULL)");
                if ($stmt_fees) {
                    $stmt_fees->bind_param("i", $student_id);
                    $stmt_fees->execute();
                    $stmt_fees->close();
                }

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
