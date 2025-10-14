<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard - Daar Al-Qur'aan</title>
    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="../css/dashboard.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400..700&display=swap" rel="stylesheet">
</head>
<body class="bg-light">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid px-4">
            <a class="navbar-brand fw-bold arabic-text" href="dashboard.php" style="font-family: 'Reem Kufi', sans-serif;">دار القرآن</a>
            <div class="d-flex align-items-center ms-auto">
                <span class="text-white me-3 fw-semibold">Welcome, <?php echo htmlspecialchars($fullname); ?></span>
                <a href="../php/logout.php" class="btn btn-outline-light btn-sm">Logout</a>
            </div>
        </div>
    </nav>


    <!-- Main Content -->
    <div class="container py-5">
        <div class="row g-4">
            <!-- Student Details Card -->
            <div class="col-md-4">
                <a href="student-details.php" class="text-decoration-none">
                    <div class="card shadow-sm p-4 text-center h-100 hover-card">
                        <i class="bi bi-people-fill display-4 text-primary mb-3"></i>
                        <h5 class="text-dark">Student Details</h5>
                    </div>
                </a>
            </div>

            <!-- Attendance Card -->
            <div class="col-md-4">
                <a href="attendance.php" class="text-decoration-none">
                    <div class="card shadow-sm p-4 text-center h-100 hover-card">
                        <i class="bi bi-calendar-check display-4 text-primary mb-3"></i>
                        <h5 class="text-dark">Attendance</h5>
                    </div>
                </a>
            </div>

            <!-- Fees Card -->
            <div class="col-md-4">
                <a href="fees.php" class="text-decoration-none">
                    <div class="card shadow-sm p-4 text-center h-100 hover-card">
                        <i class="bi bi-cash-stack display-4 text-primary mb-3"></i>
                        <h5 class="text-dark">Fees</h5>
                    </div>
                </a>
            </div>
        </div>
    </div>

    <!-- Bootstrap -->
    <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="../js/dashboard.js"></script>
</body>
</html>
