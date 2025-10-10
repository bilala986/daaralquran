<?php
header('Content-Type: application/json');
include 'db_connect.php';

$response = ["status" => "error", "message" => "Invalid request"];

try {
    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $email = trim($_POST['email'] ?? '');
        $full_name = trim($_POST['full_name'] ?? '');
        $phone_number = trim($_POST['phone_number'] ?? '');
        $emergency_contact_name = trim($_POST['emergency_contact_name'] ?? '') ?: null;
        $emergency_contact_number = trim($_POST['emergency_contact_number'] ?? '') ?: null;
        $course_completed = trim($_POST['course_completed'] ?? '');
        $class_name = trim($_POST['class_name'] ?? '');

        if (empty($course_completed) && !empty($_POST['course_completed_other'])) {
            $course_completed = trim($_POST['course_completed_other']);
        }

        if (strtolower($course_completed) === 'other' || $course_completed === '') {
            $course_completed = 'Other';
        }

        if ($email && $full_name && $phone_number && $class_name) {
            $stmt = $conn->prepare("
                INSERT INTO student_details 
                (email, full_name, phone_number, emergency_contact_name, emergency_contact_number, course_completed, class_name)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");

            if ($stmt) {
                $stmt->bind_param(
                    "sssssss",
                    $email,
                    $full_name,
                    $phone_number,
                    $emergency_contact_name,
                    $emergency_contact_number,
                    $course_completed,
                    $class_name
                );

                if ($stmt->execute()) {
                    $student_id = $stmt->insert_id;

                    // --- Generate attendance for next 4 weeks based on class weekday ---
                    $weekday = 4; // Thursday by default
                    if (stripos($class_name, 'friday') !== false) $weekday = 5;

                    $startDate = new DateTime(); // today
                    for ($i = 0; $i < 4; $i++) {
                        $nextDate = clone $startDate;
                        $dayDiff = ($weekday + 7 - (int)$nextDate->format('w')) % 7;
                        $nextDate->modify("+$dayDiff day");
                        $nextDate->modify("+$i week");
                        $dateStr = $nextDate->format('Y-m-d');

                        $stmt_att = $conn->prepare("INSERT INTO attendance (student_id, status, date) VALUES (?, NULL, ?)");
                        if ($stmt_att) {
                            $stmt_att->bind_param("is", $student_id, $dateStr);
                            $stmt_att->execute();
                            $stmt_att->close();
                        }
                    }

                    // Fees placeholder
                    $stmt_fees = $conn->prepare("
                        INSERT INTO fees (student_id, amount, status, month) 
                        VALUES (?, NULL, NULL, ?)
                    ");
                    if ($stmt_fees) {
                        $currentMonth = date('Y-m');
                        $stmt_fees->bind_param("is", $student_id, $currentMonth);
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
} catch (Exception $e) {
    $response = ["status" => "error", "message" => $e->getMessage()];
}

$conn->close();
echo json_encode($response);
