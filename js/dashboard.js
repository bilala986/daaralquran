document.addEventListener("DOMContentLoaded", () => {
    const prevBtn = document.getElementById("prevDate");
    const nextBtn = document.getElementById("nextDate");
    const dateInput = document.getElementById("attendanceDate");
    const classSelect = document.getElementById("classSelect");
    const form = document.getElementById("addStudentForm");
    const addButton = document.getElementById("addButton");
    const tabs = document.querySelectorAll('#dashboardTabs button[data-bs-toggle="tab"]');
    const feesMonthInput = document.getElementById("feesMonth");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const studentsTableBody = document.querySelector("#students table tbody");
    const attendanceTableBody = document.querySelector("#attendance table tbody");
    const feesTableBody = document.querySelector("#fees table tbody");
    let studentToDeleteId = null;
    let selectedRow = null;

    // ----------------------------
    // 🗓 Attendance Navigation
    // ----------------------------
    function getClassDayOffset() {
        const selected = classSelect.value;
        if (selected.includes("Thursday")) return 4;
        if (selected.includes("Friday")) return 5;
        return 4;
    }

    function changeWeek(direction) {
        let currentDate = new Date(dateInput.value);
        if (isNaN(currentDate)) currentDate = new Date();
        const offset = direction === "next" ? 7 : -7;
        currentDate.setDate(currentDate.getDate() + offset);
        dateInput.value = currentDate.toISOString().split("T")[0];
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener("click", () => changeWeek("next"));
        prevBtn.addEventListener("click", () => changeWeek("prev"));
    }

    if (classSelect) {
        classSelect.addEventListener("change", () => {
            const selectedDay = getClassDayOffset();
            let date = new Date(dateInput.value);
            if (isNaN(date)) date = new Date();
            while (date.getDay() !== selectedDay) {
                date.setDate(date.getDate() + 1);
            }
            dateInput.value = date.toISOString().split("T")[0];
        });
    }

    // ----------------------------
    // ➕ Add Button State
    // ----------------------------
    function updateAddButtonState(activeTabId) {
        if (!addButton) return;

        const disableTabs = ["attendance", "fees"];
        const isDisabled = disableTabs.includes(activeTabId);

        addButton.disabled = isDisabled;
        addButton.classList.toggle("disabled", isDisabled);
    }

    tabs.forEach(tab => {
        tab.addEventListener("shown.bs.tab", (e) => {
            const targetId = e.target.getAttribute("data-bs-target").replace("#", "");
            updateAddButtonState(targetId);

            if (targetId === "students") loadStudents();
            if (targetId === "attendance") loadAttendance();
            if (targetId === "fees") loadFees();
        });
    });

    const activeTab = document.querySelector('#dashboardTabs .nav-link.active');
    if (activeTab) {
        const activeId = activeTab.getAttribute("data-bs-target").replace("#", "");
        updateAddButtonState(activeId);
        if (activeId === "students") loadStudents();
        if (activeId === "attendance") loadAttendance();
        if (activeId === "fees") loadFees();
    }

    
    
    
    
    
    // ----------------------------
    // 💰 Fees Month Navigation
    // ----------------------------
    function changeMonth(direction) {
        if (!feesMonthInput) return;
        const [year, month] = feesMonthInput.value.split("-").map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
        feesMonthInput.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener("click", () => changeMonth("prev"));
        nextMonthBtn.addEventListener("click", () => changeMonth("next"));
    }

    
    
    
    
    
    
    
    
    
    
    
    // ----------------------------
    // 🧩 Add Student Form
    // ----------------------------
    if (form) {
        const addCourseDropdown = document.getElementById("add_course_completed");
        const addCourseOther = document.getElementById("add_course_completed_other");

        // Show/hide "Other" input
        addCourseDropdown.addEventListener("change", () => {
            const isOther = addCourseDropdown.value === "Other";
            addCourseOther.style.display = isOther ? "block" : "none";
            if (!isOther) addCourseOther.value = "";
            if (isOther) addCourseOther.focus();
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Handle custom "Other" course
            if (addCourseDropdown.value === "Other") {
                const customCourse = addCourseOther.value.trim();
                if (!customCourse) {
                    showToast("Please enter a course name when selecting 'Other'.", "danger");
                    addCourseOther.focus();
                    return;
                }
                const formData = new FormData(form);
                formData.set("course_completed", customCourse); // ✅ ensures correct submission
                await submitAddStudentForm(formData);
            } else {
                const formData = new FormData(form);
                await submitAddStudentForm(formData);
            }
        });
    }

    // Helper function to handle add form submission
    async function submitAddStudentForm(formData) {
        try {
            const response = await fetch("../php/add_student.php", { method: "POST", body: formData });
            const result = await response.json();

            if (result.status === "success") {
                showToast("Student added successfully ✅", "success");
                form.reset();
                document.getElementById("add_course_completed_other").style.display = "none";
                bootstrap.Modal.getInstance(document.getElementById("addStudentModal")).hide();
                loadStudents();
                loadAttendance();
                loadFees();
            } else {
                showToast(`Error adding student: ${result.message || "Please try again."}`, "danger");
            }
        } catch (err) {
            console.error("Add Student JSON error:", err);
            showToast("Error adding student. Please try again.", "danger");
        }
    }

    // ----------------------------
    // 📋 Load Students from DB
    // ----------------------------
    let allStudents = [];

    async function fetchStudents() {
        try {
            const response = await fetch("../php/get_students.php");
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            allStudents = await response.json();
            return allStudents;
        } catch (error) {
            console.error("Error fetching students:", error);
            return [];
        }
    }

    async function loadStudents() {
        if (!studentsTableBody) return;
        studentsTableBody.innerHTML = `<tr><td colspan="7" class="text-muted py-3">Loading...</td></tr>`;

        const students = await fetchStudents();
        if (!students.length) {
            studentsTableBody.innerHTML = `<tr><td colspan="7" class="text-muted py-3">No students found.</td></tr>`;
            return;
        }

        studentsTableBody.innerHTML = students.map(student => `
            <tr>
                <td>${student.email}</td>
                <td>${student.full_name}</td>
                <td>${student.phone_number}</td>
                <td>${student.emergency_contact_name || "-"}</td>
                <td>${student.emergency_contact_number || "-"}</td>
                <td>${student.course_completed || "-"}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-1 btn-edit-student" data-id="${student.id}">
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-delete-student" data-id="${student.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join("");
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // ----------------------------
    // ✏️ Edit Student Functionality
    // ----------------------------
    const editCourseDropdown = document.getElementById("edit_course_completed");
    const editCourseOther = document.getElementById("edit_course_completed_other");

    if (editCourseDropdown) {
        editCourseDropdown.addEventListener("change", () => {
            const isOther = editCourseDropdown.value === "Other";
            editCourseOther.style.display = isOther ? "block" : "none";
            if (!isOther) editCourseOther.value = "";
            if (isOther) editCourseOther.focus();
        });
    }

    document.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".btn-edit-student");
        if (!editBtn) return;

        const studentId = editBtn.getAttribute("data-id");
        const student = allStudents.find(s => s.id === studentId);
        if (!student) return;

        // Fill modal fields
        document.getElementById("edit_student_id").value = student.id;
        document.getElementById("edit_email").value = student.email;
        document.getElementById("edit_full_name").value = student.full_name;
        document.getElementById("edit_phone_number").value = student.phone_number;
        document.getElementById("edit_emergency_contact_name").value = student.emergency_contact_name || "";
        document.getElementById("edit_emergency_contact_number").value = student.emergency_contact_number || "";

        // Handle course dropdown and "Other" input
        const knownCourses = ["Tafseer of Juz 30", "Seerah Course", "40 Hadeeth of Imam Nawwawi", "None"];
        if (knownCourses.includes(student.course_completed)) {
            editCourseDropdown.value = student.course_completed;
            editCourseOther.style.display = "none";
            editCourseOther.value = "";
        } else {
            editCourseDropdown.value = "Other";
            editCourseOther.style.display = "block";
            editCourseOther.value = student.course_completed;
        }

        new bootstrap.Modal(document.getElementById("editStudentModal")).show();
    });

    const editForm = document.getElementById("editStudentForm");
    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(editForm);

            // Handle "Other" course properly
            if (editCourseDropdown.value === "Other") {
                const customCourse = editCourseOther.value.trim();
                if (!customCourse) {
                    showToast("Please enter a course name when selecting 'Other'.", "danger");
                    editCourseOther.focus();
                    return;
                }
                formData.set("course_completed", customCourse); // ✅ key fix for editing
            }

            try {
                const response = await fetch("../php/update_student.php", {
                    method: "POST",
                    body: formData
                });
                const result = await response.json();

                if (result.status === "success") {
                    showToast("Student updated successfully ✅", "success");
                    bootstrap.Modal.getInstance(document.getElementById("editStudentModal")).hide();
                    await loadStudents();
                } else {
                    showToast(`Error updating student: ${result.message || "Unknown error"}`, "danger");
                }
            } catch (error) {
                console.error("Update error:", error);
                showToast("Network or server error while updating student.", "danger");
            }
        });
    }

    // ----------------------------
    // ✅ Reusable Toast Function
    // ----------------------------
    function showToast(message, type = "success") {
        const toast = document.createElement("div");
        toast.className = "position-fixed bottom-0 end-0 p-3";
        toast.innerHTML = `
            <div class="toast align-items-center text-bg-${type} border-0 show" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }


    
    
    
    
    
    
    
    
    // ----------------------------
    // ✏️ Delete Student Functionality
    // ----------------------------
    document.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete-student");
        if (!deleteBtn) return;

        studentToDeleteId = deleteBtn.getAttribute("data-id");
        if (!studentToDeleteId) return;

        // Find the student name from allStudents array
        const student = allStudents.find(s => s.id === studentToDeleteId);
        const studentName = student ? student.full_name : "this student";

        // Update modal message
        const deleteMessage = document.getElementById("deleteStudentMessage");
        deleteMessage.textContent = `Are you sure you want to delete "${studentName}"? This will also remove their attendance and fees records.`;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById("deleteStudentModal"));
        modal.show();
    });

    // Handle confirm delete button
    const confirmDeleteBtn = document.getElementById("confirmDeleteStudentBtn");
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", async () => {
            if (!studentToDeleteId) return;

            try {
                const response = await fetch("../php/delete_student.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: studentToDeleteId })
                });
                const result = await response.json();

                if (result.status === "success") {
                    showToast("Student deleted successfully ✅", "success");
                    await loadStudents();
                    loadAttendance();
                    loadFees();
                } else {
                    showToast(`Error deleting student: ${result.message || "Unknown error"}`, "danger");
                }
            } catch (err) {
                console.error("Delete student error:", err);
                showToast("Network or server error while deleting student.", "danger");
            }

            // Hide modal
            const modalEl = document.getElementById("deleteStudentModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            studentToDeleteId = null;
        });
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    // ----------------------------
    // 🧾 Load Attendance Table (with backend loading + saving)
    // ----------------------------
    async function loadAttendance() {
        if (!attendanceTableBody) return;
        attendanceTableBody.innerHTML = `<tr><td colspan="4" class="text-muted">Loading...</td></tr>`;

        // Get date selected from input (default = today)
        const selectedDate = document.getElementById("attendanceDate")?.value || new Date().toISOString().split("T")[0];

        // Fetch students and their attendance status for the selected date
        const [students, attendanceData] = await Promise.all([
            fetchStudents(),
            fetch(`../php/get_attendance.php?date=${selectedDate}`).then(res => res.json()).catch(() => [])
        ]);

        if (!students.length) {
            attendanceTableBody.innerHTML = `<tr><td colspan="4" class="text-muted">No students found.</td></tr>`;
            return;
        }

        // Create a quick lookup map for attendance by student_id
        const attendanceMap = {};
        attendanceData.forEach(a => {
            attendanceMap[a.student_id] = a.status;
        });

        attendanceTableBody.innerHTML = students.map((student, index) => {
            const status = attendanceMap[student.id] || "–";
            const badgeClass =
                status === "Present" ? "text-bg-success" :
                status === "Absent" ? "text-bg-danger" :
                "text-bg-secondary";

            return `
                <tr data-student-id="${student.id}">
                    <td>${index + 1}</td>
                    <td>${student.full_name}</td>
                    <td class="status-cell"><span class="badge ${badgeClass}">${status}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm edit-attendance">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        let selectedRow = null;

        // Handle "Edit" button clicks
        document.querySelectorAll(".edit-attendance").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const row = e.target.closest("tr");
                const studentName = row.children[1].textContent;
                selectedRow = row;
                document.getElementById("studentName").textContent = studentName;

                const modal = new bootstrap.Modal(document.getElementById("attendanceModal"));
                modal.show();
            });
        });

        // ✅ Function to update attendance in backend
        async function updateAttendanceStatus(selectedRow, status) {
            const studentId = selectedRow.dataset.studentId;

            try {
                const response = await fetch("../php/update_attendance.php", {
                    method: "POST",
                    body: new URLSearchParams({
                        student_id: studentId,
                        status: status,
                        date: selectedDate
                    })
                });

                const result = await response.json();

                if (result.status === "success") {
                    const statusCell = selectedRow.querySelector(".status-cell");
                    const badgeClass = status === "Present" ? "text-bg-success" : "text-bg-danger";
                    statusCell.innerHTML = `<span class="badge ${badgeClass}">${status}</span>`;
                    showToast(`Attendance marked as ${status}`, "success");
                } else {
                    showToast(`Error: ${result.message}`, "danger");
                }
            } catch (error) {
                console.error("Update error:", error);
                showToast("Network error while updating attendance", "danger");
            }

            bootstrap.Modal.getInstance(document.getElementById("attendanceModal")).hide();
        }

        // ✅ Handle Present/Absent button clicks
        document.getElementById("markPresent").onclick = () => {
            if (!selectedRow) return;
            updateAttendanceStatus(selectedRow, "Present");
        };

        document.getElementById("markAbsent").onclick = () => {
            if (!selectedRow) return;
            updateAttendanceStatus(selectedRow, "Absent");
        };
    }





    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // ----------------------------
    // 💰 Fees Month Navigation
    // ----------------------------
    function changeMonth(direction) {
        if (!feesMonthInput) return;
        const [year, month] = feesMonthInput.value.split("-").map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
        feesMonthInput.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        loadFees(); // reload fees for new month
    }

    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener("click", () => changeMonth("prev"));
        nextMonthBtn.addEventListener("click", () => changeMonth("next"));
    }

    // ----------------------------
    // 💵 Load Fees Table (Month Hidden from UI)
    // ----------------------------
    async function loadFees() {
        if (!feesTableBody) return;
        feesTableBody.innerHTML = `<tr><td colspan="5" class="text-muted">Loading...</td></tr>`;

        const students = await fetchStudents();
        if (!students.length) {
            feesTableBody.innerHTML = `<tr><td colspan="5" class="text-muted">No students found.</td></tr>`;
            return;
        }

        // Get currently selected month (YYYY-MM)
        const currentMonth = feesMonthInput ? feesMonthInput.value : new Date().toISOString().slice(0, 7);

        // Populate fees table with student data for that month
        feesTableBody.innerHTML = students.map((student, index) => `
            <tr data-student-id="${student.id}" data-month="${currentMonth}">
                <td>${index + 1}</td>
                <td>${student.full_name}</td>
                <td><span class="badge text-bg-secondary">–</span></td>
                <td><span class="badge text-bg-secondary">Pending</span></td>
                <td>
                    <button class="btn btn-primary btn-sm" disabled>
                        <i class="bi bi-pencil-square"></i> Edit
                    </button>
                </td>
            </tr>
        `).join("");
    }

});
