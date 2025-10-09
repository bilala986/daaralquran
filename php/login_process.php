<?php
session_start();
header('Content-Type: application/json');

include 'db_connect.php'; // ✅ Already sets up $conn

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please fill in all fields."]);
    exit;
}

// Prepare statement
$stmt = $conn->prepare("SELECT id, fullname, password FROM users_auth WHERE email = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    $stmt->close();
    $conn->close();
    exit;
}

// ✅ Login success
$_SESSION['user_id'] = $user['id'];
$_SESSION['fullname'] = $user['fullname'];

echo json_encode(["success" => true, "message" => "Login successful!"]);

$stmt->close();
$conn->close();
?>
