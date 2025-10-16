<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Attendance - Daar Al-Qur'aan</title>

    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="../css/dashboard.css" rel="stylesheet" />
    <link href="../css/attendance.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />
    <style>
        .selected-date-btn {
            background-color: #0d6efd !important;
            color: #fff !important;
            border-color: #0d6efd !important;
        }
        #calendarContainer button { min-width: 40px; min-height: 36px; }
    </style>

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


    <!-- Back Button -->
    <div class="container mt-3">
        <a href="dashboard.php" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-arrow-left"></i> Back to Dashboard
        </a>
    </div>
    
    <!-- Page Title -->
    <div class="container mt-3">
        <h3 class="fw-semibold">Attendance</h3>
    </div>

    <!-- Page Title + Controls -->
    <div class="container-fluid mt-4">
        <div class="card p-3 shadow-sm">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 top-controls">
    
                <!-- Left Side: Search -->
                <div class="input-group me-3 mb-2" style="max-width: 300px;">
                    <input id="attendanceSearchInput" type="text" class="form-control" placeholder="Search by name...">
                </div>

                <!-- Right Side: Class + Buttons -->
                <div class="d-flex align-items-center gap-2 mb-2">
                    <select id="attendanceClassSelect" class="form-select form-select-sm w-auto">
                        <option value="Thursday Adults">Thursday Adults</option>
                        <option value="Friday Adults">Friday Adults</option>
                        <option value="Friday Kids">Friday Kids</option>
                    </select>

                    <button id="attendanceRefreshBtn" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                    <button id="attendanceFilterBtn" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-filter"></i>
                    </button>
                    <button id="attendanceSaveBtn" class="btn btn-primary btn-sm" disabled>
                        <i class="bi bi-save"></i>
                    </button>
                </div>

            </div>


            <!-- Calendar Controls -->
            <div class="row mb-3 align-items-center">
                <div class="col-12 col-md-4 d-flex justify-content-start">
                    <button id="nextClassBtn" class="btn btn-outline-primary btn-sm">Calendar</button>
                </div>
                <div class="col-12 col-md-4 d-flex justify-content-center align-items-center">
                    <span id="selectedDate" class="fw-bold text-primary"></span>
                </div>
            </div>

            <!-- Updated Calendar Container (no flex classes) -->
            <div id="calendarContainer" class="mt-2" style="display:none;"></div>

            <!-- Attendance Table -->
            <div class="table-responsive mt-3">
                <table class="table table-hover align-middle text-center">
                    <thead class="table-light">
                        <tr>
                            <th class="d-none d-sm-table-cell">#</th>
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
                        <label class="form-label">Status</label>
                        <select id="attendanceFilterStatus" class="form-select">
                            <option value="">Any</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer d-flex justify-content-between">
                    <button type="button" id="attendanceClearFilters" class="btn btn-outline-danger">Clear Filter</button>
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
