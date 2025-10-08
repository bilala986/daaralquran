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
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
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
                    <button id="addButton" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#addStudentModal">
                        <i class="bi bi-plus-lg"></i> Add
                    </button>
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
                                <!-- Empty tbody: will be populated dynamically by dashboard.js -->
                                <tbody class="text-center"></tbody>
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
                                <input type="date" id="attendanceDate" class="form-control form-control-sm" value="<?= date('Y-m-d') ?>">
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
                                    <!-- You can keep this static for now or later load dynamically -->
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
                                <tbody>
                                    <!-- Populated dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Add Student Modal -->
        <div class="modal fade" id="addStudentModal" tabindex="-1" aria-labelledby="addStudentLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="addStudentLabel">Add New Student</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form id="addStudentForm">
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" class="form-control" name="full_name" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Phone Number</label>
                                    <input type="text" class="form-control" name="phone_number" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Emergency Contact Name</label>
                                    <input type="text" class="form-control" name="emergency_contact_name" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Emergency Contact Number</label>
                                    <input type="text" class="form-control" name="emergency_contact_number" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Course Completed</label>
                                    <select id="add_course_completed" name="course_completed" class="form-select" required>
                                        <option value="Tafseer of Juz 30">Tafseer of Juz 30</option>
                                        <option value="Seerah Course">Seerah Course</option>
                                        <option value="40 Hadeeth of Imam Nawwawi">40 Hadeeth of Imam Nawwawi</option>
                                        <option value="None">None</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <input type="text" id="add_course_completed_other" class="form-control mt-2" placeholder="Enter course" style="display:none;">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-success">Add Student</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- ✏️ Edit Student Modal -->
        <div class="modal fade" id="editStudentModal" tabindex="-1" aria-labelledby="editStudentModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <form id="editStudentForm">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="editStudentModalLabel">Edit Student</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="edit_student_id" name="id">

                            <div class="mb-3">
                                <label for="edit_email" class="form-label">Email</label>
                                <input type="email" id="edit_email" name="email" class="form-control" required>
                            </div>

                            <div class="mb-3">
                                <label for="edit_full_name" class="form-label">Full Name</label>
                                <input type="text" id="edit_full_name" name="full_name" class="form-control" required>
                            </div>

                            <div class="mb-3">
                                <label for="edit_phone_number" class="form-label">Phone Number</label>
                                <input type="text" id="edit_phone_number" name="phone_number" class="form-control" required>
                            </div>

                            <div class="mb-3">
                                <label for="edit_emergency_contact_name" class="form-label">Emergency Contact Name</label>
                                <input type="text" id="edit_emergency_contact_name" name="emergency_contact_name" class="form-control">
                            </div>

                            <div class="mb-3">
                                <label for="edit_emergency_contact_number" class="form-label">Emergency Contact Number</label>
                                <input type="text" id="edit_emergency_contact_number" name="emergency_contact_number" class="form-control">
                            </div>

                            <div class="mb-3">
                                <label for="edit_course_completed" class="form-label">Course Completed</label>
                                <select id="edit_course_completed" name="course_completed" class="form-select" required>
                                    <option value="Tafseer of Juz 30">Tafseer of Juz 30</option>
                                    <option value="Seerah Course">Seerah Course</option>
                                    <option value="40 Hadeeth of Imam Nawwawi">40 Hadeeth of Imam Nawwawi</option>
                                    <option value="None">None</option>
                                    <option value="Other">Other</option>
                                </select>
                                <input type="text" id="edit_course_completed_other" class="form-control mt-2" placeholder="Enter course" style="display:none;">
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>



        <!-- Bootstrap JS -->
        <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="../js/dashboard.js"></script>

    </body>
</html>
