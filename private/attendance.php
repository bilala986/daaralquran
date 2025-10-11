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
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Attendance - Daar Al-Qur'aan</title>

    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="../css/dashboard.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />
    <style>
        .selected-date-btn {
            background-color: #0d6efd !important;
            color: #fff !important;
            border-color: #0d6efd !important;
        }
        #calendarContainer button { min-width: 40px; min-height: 36px; }
    </style>
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

    <!-- Page Title + Controls -->
    <div class="container-fluid mt-4">
        <div class="card p-3 shadow-sm">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 top-controls">
                <h3 class="fw-semibold text-primary mb-2 mb-md-0">Attendance</h3>

                <!-- Search bar -->
                <div class="input-group" style="max-width: 300px;">
                    <span class="input-group-text bg-white">
                        <i class="bi bi-search"></i>
                    </span>
                    <input id="attendanceSearchInput" type="text" class="form-control" placeholder="Search by name...">
                </div>

                <!-- Refresh + Filter -->
                <div class="d-flex gap-2">
                    <button id="attendanceRefreshBtn" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-arrow-clockwise"></i> Refresh
                    </button>
                    <button id="attendanceFilterBtn" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-filter"></i> Filter
                    </button>
                </div>
            </div>

            <!-- Class & Calendar -->
            <div class="row mb-3 align-items-center">
                <div class="col-12 col-md-4 d-flex justify-content-start">
                    <select id="attendanceClassSelect" class="form-select form-select-sm w-auto">
                        <option value="Thursday Adults">Thursday Adults</option>
                        <option value="Friday Adults">Friday Adults</option>
                        <option value="Friday Kids">Friday Kids</option>
                    </select>
                </div>
                <div class="col-12 col-md-4 d-flex justify-content-center align-items-center">
                    <button id="nextClassBtn" class="btn btn-outline-primary btn-sm">Calendar</button>
                </div>
                <div class="col-12 col-md-4 d-flex justify-content-end align-items-center">
                    <span id="selectedDate" class="fw-bold text-primary"></span>
                </div>
            </div>

            <div id="calendarContainer" class="mt-2 d-flex flex-wrap justify-content-center gap-1" style="display:none;"></div>

            <!-- Attendance Table -->
            <div class="table-responsive mt-3">
                <table class="table table-hover align-middle text-center">
                    <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>Student Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="attendanceTableBody">
                        <!-- Populated by JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Attendance Edit Modal -->
    <div class="modal fade" id="attendanceModal" tabindex="-1" aria-labelledby="attendanceModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="attendanceModalLabel">Mark Attendance</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <p class="mb-3 fs-5">Mark attendance for:</p>
                    <h5 id="studentName" class="fw-bold text-primary"></h5>

                    <div class="mb-3">
                        <label class="form-label">Selected Date</label>
                        <p class="fw-bold">Date: <span id="selectedAttendanceDate"><?= date('Y-m-d') ?></span></p>
                    </div>

                    <div id="attendanceCalendar" class="d-flex flex-wrap gap-2 justify-content-center mb-3">
                        <!-- Dates generated dynamically -->
                    </div>

                    <div class="d-flex justify-content-center gap-3 mt-4">
                        <button id="markPresent" class="btn btn-success px-4">Present</button>
                        <button id="markAbsent" class="btn btn-danger px-4">Absent</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Modal -->
    <div class="modal fade" id="attendanceFilterModal" tabindex="-1" aria-labelledby="attendanceFilterModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="attendanceFilterModalLabel">Filter Attendance</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Class</label>
                        <select id="attendanceFilterClass" class="form-select">
                            <option value="">Any</option>
                            <option value="Thursday Adults">Thursday Adults</option>
                            <option value="Friday Adults">Friday Adults</option>
                            <option value="Friday Kids">Friday Kids</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Status</label>
                        <select id="attendanceFilterStatus" class="form-select">
                            <option value="">Any</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer d-flex justify-content-between">
                    <button type="button" id="attendanceClearFilters" class="btn btn-outline-danger">Clear Filters</button>
                    <div>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" id="attendanceApplyFilters" class="btn btn-primary">Apply Filters</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="../js/attendance.js"></script>
</body>
</html>
