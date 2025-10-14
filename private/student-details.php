<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Student Details - Daar Al-Qur'aan</title>

    <link href="../bootstrap/css/bootstrap.min.css" rel="stylesheet" />
    <link href="../css/dashboard.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet" />
    <style>
        .top-controls .form-control { min-width: 260px; }
        .selected-date-btn {
            background-color: #0d6efd !important;
            color: #fff !important;
            border-color: #0d6efd !important;
        }
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
        <h3 class="fw-semibold">Student Details</h3>
    </div>

    <!-- Page Content -->
    <div class="container-fluid mt-4">
        <div class="card p-3 shadow-sm">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 top-controls">

                <!-- Search (reduced width) -->
                <div class="input-group" style="max-width: 300px;">
                    <span class="input-group-text bg-white">
                        <i class="bi bi-search"></i>
                    </span>
                    <input id="searchInput" type="text" class="form-control" placeholder="Search by name, email or phone...">
                </div>


                <!-- Controls (aligned right, dropdown removed) -->
                <div class="d-flex gap-2">
                    <button id="refreshBtn" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-arrow-clockwise"></i> Refresh
                    </button>

                    <button id="filterBtn" class="btn btn-outline-secondary btn-sm">
                        <i class="bi bi-filter"></i> Filter
                    </button>

                    <button id="addButton" class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addStudentModal">
                        <i class="bi bi-plus-lg"></i> Add
                    </button>
                </div>
            </div>


            <!-- Table -->
            <div class="table-responsive">
                <table class="table table-hover align-middle text-center" id="studentsTable">
                    <thead class="table-light">
                        <tr>
                            <th>Email</th>
                            <th>Full Name</th>
                            <th>Phone Number</th>
                            <th>Emergency Contact Name</th>
                            <th>Emergency Contact Number</th>
                            <th>Course Completed</th>
                            <th>Class</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="studentsTbody" class="text-center">
                        <!-- populated by JS -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Add Student Modal -->
    <div class="modal fade" id="addStudentModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Add New Student</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
                                <input type="text" class="form-control" name="emergency_contact_name">
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Emergency Contact Number</label>
                                <input type="text" class="form-control" name="emergency_contact_number">
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
                                <input type="text" id="add_course_completed_other" name="course_completed_other" class="form-control mt-2" placeholder="Enter course" style="display:none;">
                            </div>

                            <div class="col-md-6">
                                <label class="form-label">Class</label>
                                <select id="add_class_name" name="class_name" class="form-select" required>
                                    <option value="" disabled selected>Select class</option>
                                    <option value="Thursday Adults">Thursday Adults</option>
                                    <option value="Friday Adults">Friday Adults</option>
                                    <option value="Friday Kids">Friday Kids</option>
                                </select>
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

    <!-- Edit Student Modal -->
    <div class="modal fade" id="editStudentModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <form id="editStudentForm">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Edit Student</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body">
                        <input type="hidden" id="edit_student_id" name="id">

                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input id="edit_email" name="email" class="form-control" type="email" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Full Name</label>
                            <input id="edit_full_name" name="full_name" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Phone Number</label>
                            <input id="edit_phone_number" name="phone_number" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Emergency Contact Name</label>
                            <input id="edit_emergency_contact_name" name="emergency_contact_name" class="form-control">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Emergency Contact Number</label>
                            <input id="edit_emergency_contact_number" name="emergency_contact_number" class="form-control">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Course Completed</label>
                            <select id="edit_course_completed" name="course_completed" class="form-select" required>
                                <option value="Tafseer of Juz 30">Tafseer of Juz 30</option>
                                <option value="Seerah Course">Seerah Course</option>
                                <option value="40 Hadeeth of Imam Nawwawi">40 Hadeeth of Imam Nawwawi</option>
                                <option value="None">None</option>
                                <option value="Other">Other</option>
                            </select>
                            <input type="text" id="edit_course_completed_other" name="course_completed_other" class="form-control mt-2" placeholder="Enter course" style="display:none;">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Class</label>
                            <select id="edit_class_name" name="class_name" class="form-select" required>
                                <option value="" disabled>Select class</option>
                                <option value="Thursday Adults">Thursday Adults</option>
                                <option value="Friday Adults">Friday Adults</option>
                                <option value="Friday Kids">Friday Kids</option>
                            </select>
                        </div>

                    </div>

                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteStudentModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">Delete Student</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p id="deleteStudentMessage">Are you sure you want to delete this student?</p>
                </div>
                <div class="modal-footer">
                    <button id="cancelDeleteBtn" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button id="confirmDeleteStudentBtn" type="button" class="btn btn-danger">Delete</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Filter Modal -->
    <div class="modal fade" id="filterModal" tabindex="-1" aria-labelledby="filterModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="filterModalLabel">Filter Students</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">

                    <!-- Course Completed Filter -->
                    <div class="mb-3">
                        <label class="form-label">Course Completed</label>
                        <select id="filterCourse" class="form-select">
                            <option value="">Any</option>
                            <option value="Tafseer of Juz 30">Tafseer of Juz 30</option>
                            <option value="Seerah Course">Seerah Course</option>
                            <option value="40 Hadeeth of Imam Nawwawi">40 Hadeeth of Imam Nawwawi</option>
                            <option value="None">None</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <!-- Class Filter -->
                    <div class="mb-3">
                        <label class="form-label">Class</label>
                        <select id="filterClassModal" class="form-select">
                            <option value="">Any</option>
                            <option value="Thursday Adults">Thursday Adults</option>
                            <option value="Friday Adults">Friday Adults</option>
                            <option value="Friday Kids">Friday Kids</option>
                        </select>
                    </div>

                </div>
                <div class="modal-footer d-flex justify-content-between">
                    <button type="button" id="clearFilters" class="btn btn-outline-danger">Clear Filters</button>
                    <div>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" id="applyFilters" class="btn btn-primary">Apply Filters</button>
                    </div>
                </div>
            </div>
        </div>
    </div>



    <!-- Toast container (optional) -->
    <div id="toastContainer"></div>

    <script src="../bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="../js/fetchStudents.js"></script>
    <script src="../js/student-details.js"></script>
</body>
</html>
