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
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard - Daar Al-Qur'aan</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400..700&display=swap" rel="stylesheet">
        <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link href="../css/dashboard.css" rel="stylesheet">
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

        <!-- Dashboard Content -->
        <div class="container-fluid mt-4">

            <!-- Top Bar -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <!-- Search -->
                <div class="input-group w-50">
                    <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" placeholder="Search..." aria-label="Search">
                </div>

                <!-- Buttons -->
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
                    <button class="btn btn-outline-secondary"><i class="bi bi-filter"></i> Filter</button>
                    <button id="addButton" class="btn btn-success"><i class="bi bi-plus-lg"></i> Add</button>
                </div>
            </div>

            <!-- Tabs -->
            <ul class="nav nav-tabs mb-3" id="dashboardTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="students-tab" data-bs-toggle="tab" data-bs-target="#students" type="button" role="tab">Student Details</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="attendance-tab" data-bs-toggle="tab" data-bs-target="#attendance" type="button" role="tab">Attendance</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="fees-tab" data-bs-toggle="tab" data-bs-target="#fees" type="button" role="tab">Fees</button>
                </li>
            </ul>

            <!-- Tab Contents -->
            <div class="tab-content" id="dashboardTabsContent">

                <!-- Student Details -->
                <div class="tab-pane fade show active" id="students" role="tabpanel">
                    <div class="card p-3 shadow-sm">
                        <h5 class="mb-3 text-primary">Student Details</h5>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light text-center">
                                    <tr>
                                        <th>Email</th>
                                        <th>Full Name</th>
                                        <th>Phone Number</th>
                                        <th>Emergency Contact Name</th>
                                        <th>Emergency Contact Number</th>
                                        <th>Course Completed</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="text-center">
                                    <tr>
                                        <td>student1@example.com</td>
                                        <td>Fatimah Ali</td>
                                        <td>07123 456789</td>
                                        <td>Aisha Ali</td>
                                        <td>07123 111222</td>
                                        <td>Tafseer of Juz 30</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                                            <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>student2@example.com</td>
                                        <td>Zahra Ahmed</td>
                                        <td>07987 654321</td>
                                        <td>Maryam Ahmed</td>
                                        <td>07987 222333</td>
                                        <td>40 Hadeeth of Imam Nawwawi</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                                            <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>student3@example.com</td>
                                        <td>Layla Khan</td>
                                        <td>07700 900123</td>
                                        <td>Sumayyah Khan</td>
                                        <td>07700 456789</td>
                                        <td>None</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                                            <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Attendance -->
                <div class="tab-pane fade" id="attendance" role="tabpanel">
                    <div class="card p-3 shadow-sm">
                        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                            <h5 class="text-primary mb-2 mb-md-0">Attendance</h5>

                            <!-- Class Selector -->
                            <div class="d-flex align-items-center gap-2">
                                <label for="classSelect" class="fw-semibold me-1">Class:</label>
                                <select id="classSelect" class="form-select form-select-sm w-auto">
                                    <option selected>Thursday (Adults)</option>
                                    <option>Friday (Adults)</option>
                                    <option>Friday (Kids)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Date Navigation -->
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <button id="prevDate" class="btn btn-outline-secondary btn-sm">
                                <i class="bi bi-chevron-left"></i> Previous
                            </button>

                            <div class="d-flex align-items-center gap-2">
                                <input type="date" id="attendanceDate" class="form-control form-control-sm" value="2025-10-03">
                            </div>

                            <button id="nextDate" class="btn btn-outline-secondary btn-sm">
                                Next <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>

                        <!-- Attendance Table -->
                        <div class="table-responsive">
                            <table class="table table-hover align-middle text-center">
                                <thead class="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Student Name</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Aisha Khan</td>
                                        <td><span class="badge bg-secondary">—</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Fatimah Ali</td>
                                        <td><span class="badge bg-secondary">—</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>Zahra Ahmed</td>
                                        <td><span class="badge bg-secondary">—</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Fees -->
                <div class="tab-pane fade" id="fees" role="tabpanel">
                    <div class="card p-3 shadow-sm">
                        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
                            <h5 class="text-primary mb-2 mb-md-0">Fees</h5>

                            <!-- Month Navigation -->
                            <div class="d-flex align-items-center gap-2">
                                <button id="prevMonth" class="btn btn-outline-secondary btn-sm">
                                    <i class="bi bi-chevron-left"></i> Previous
                                </button>

                                <input type="month" id="feesMonth" class="form-control form-control-sm" value="2025-10">

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
                                        <th>Month</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>Aisha Khan</td>
                                        <td>October 2025</td>
                                        <td>£10</td>
                                        <td><span class="badge bg-success">Paid</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>Fatimah Ali</td>
                                        <td>October 2025</td>
                                        <td>£10</td>
                                        <td><span class="badge bg-warning text-dark">Pending</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary me-1"><i class="bi bi-pencil"></i></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


            </div>


        </div>

        <!-- Bootstrap Icons + JS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
        <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="../js/dashboard.js"></script>

    </body>
</html>
