<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: ../login.html");
    exit;
}

$fullname = $_SESSION['fullname'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fees - Daar Al-Qur'aan</title>
    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="../css/dashboard.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />
</head>
<body class="bg-light">

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid px-4">
            <a class="navbar-brand fw-bold arabic-text" href="dashboard.php">دار القرآن</a>
            <div class="d-flex align-items-center ms-auto">
                <span class="text-white me-3 fw-semibold">Welcome, <?php echo htmlspecialchars($fullname); ?></span>
                <a href="../php/logout.php" class="btn btn-outline-light btn-sm">Logout</a>
            </div>
        </div>
    </nav>
    
    <!-- Back Button -->
    <div class="container mt-3">
        <a href="dashboard.php" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-arrow-left"></i> Back to Dashboard
        </a>
    </div>

    <!-- Main Content -->
    <div class="container py-5">
        <div class="card p-3 shadow-sm">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                <h5 class="text-primary mb-2 mb-md-0">Fees</h5>

                <!-- Month Navigation -->
                <div class="d-flex align-items-center gap-2">
                    <button id="prevMonth" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-chevron-left"></i> Previous
                    </button>

                    <input type="month" id="feesMonth" class="form-control form-control-sm" value="<?= date('Y-m') ?>">

                    <button id="nextMonth" class="btn btn-outline-secondary btn-sm">
                        Next <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>

            <!-- Fees Table -->
            <div class="table-responsive">
                <table class="table table-hover align-middle text-center">
                    <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>Student Name</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="feesTableBody">
                        <!-- populated by JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="../js/fetchStudents.js"></script>
    <script src="../js/fees.js"></script>
</body>
</html>
