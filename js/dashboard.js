document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------
    // Elements
    // ----------------------------
    const addButton = document.getElementById("addButton");
    const tabs = document.querySelectorAll('#dashboardTabs button[data-bs-toggle="tab"]');
    const studentsTableBody = document.querySelector("#students table tbody");
    const feesTableBody = document.querySelector("#fees table tbody");
    const feesMonthInput = document.getElementById("feesMonth");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const form = document.getElementById("addStudentForm");

    // --- Attendance Elements ---
    const attendanceTableBody = document.querySelector("#attendance table tbody");
    const classSelect = document.getElementById("attendanceClassSelect");
    const nextClassBtn = document.getElementById("nextClassBtn");
    const selectedDateEl = document.getElementById("selectedDate"); // <-- updated to match new HTML
    const calendarContainer = document.getElementById("calendarContainer"); // <-- updated to match new HTML
    calendarContainer.style.display = "none";
    
    // --- Attendance Modal Elements ---
    const attendanceModal = new bootstrap.Modal(document.getElementById("attendanceModal"));
    const studentNameEl = document.getElementById("studentName");
    const markPresentBtn = document.getElementById("markPresent");
    const markAbsentBtn = document.getElementById("markAbsent");


    // --- Edit Student Modal Elements ---
    const editCourseDropdown = document.getElementById("edit_course_completed");
    const editCourseOther = document.getElementById("edit_course_completed_other");
    const editClassDropdown = document.getElementById("edit_class_name");

    let studentToDeleteId = null;
    let selectedStudentId = null;
    let selectedAttendanceDate = new Date();
    let allStudents = [];
    let isCalendarVisible = false;

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
    // 🧩 Add Student Form
    // ----------------------------
    if (form) {
        const addCourseDropdown = document.getElementById("add_course_completed");
        const addCourseOther = document.getElementById("add_course_completed_other");

        addCourseDropdown.addEventListener("change", () => {
            const isOther = addCourseDropdown.value === "Other";
            addCourseOther.style.display = isOther ? "block" : "none";
            if (!isOther) addCourseOther.value = "";
            if (isOther) addCourseOther.focus();
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            if (addCourseDropdown.value === "Other") {
                const customCourse = addCourseOther.value.trim();
                if (!customCourse) {
                    showToast("Please enter a course name when selecting 'Other'.", "danger");
                    addCourseOther.focus();
                    return;
                }
                formData.set("course_completed", customCourse);
            }

            await submitAddStudentForm(formData);
        });
    }

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
    // 📋 Fetch Students
    // ----------------------------
    async function fetchStudents() {
        try {
            const res = await fetch("../php/get_students.php");
            if (!res.ok) throw new Error("Server error");
            allStudents = await res.json();
            return allStudents;
        } catch (err) {
            console.error("Error fetching students:", err);
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

        studentsTableBody.innerHTML = students.map((student, index) => `
            <tr>
                <td>${student.email}</td>
                <td>${student.full_name}</td>
                <td>${student.phone_number}</td>
                <td>${student.emergency_contact_name || "-"}</td>
                <td>${student.emergency_contact_number || "-"}</td>
                <td>${student.course_completed || "-"}</td>
                <td>${student.class_name || "-"}</td>
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
    // ✏️ Edit Student
    // ----------------------------
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
        const student = allStudents.find(s => s.id == studentId);
        if (!student) return;

        document.getElementById("edit_student_id").value = student.id;
        document.getElementById("edit_email").value = student.email;
        document.getElementById("edit_full_name").value = student.full_name;
        document.getElementById("edit_phone_number").value = student.phone_number;
        document.getElementById("edit_emergency_contact_name").value = student.emergency_contact_name || "";
        document.getElementById("edit_emergency_contact_number").value = student.emergency_contact_number || "";
        if (editClassDropdown) editClassDropdown.value = student.class_name || "";

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
            const selectedClass = editClassDropdown?.value || "";
            formData.set("class_name", selectedClass);

            if (editCourseDropdown.value === "Other") {
                const customCourse = editCourseOther.value.trim();
                if (!customCourse) {
                    showToast("Please enter a course name when selecting 'Other'.", "danger");
                    editCourseOther.focus();
                    return;
                }
                formData.set("course_completed", customCourse);
            }

            try {
                const res = await fetch("../php/update_student.php", { method: "POST", body: formData });
                const result = await res.json();
                if (result.status === "success") {
                    showToast("Student updated successfully ✅", "success");
                    bootstrap.Modal.getInstance(document.getElementById("editStudentModal")).hide();
                    await loadStudents();
                } else {
                    showToast(`Error updating student: ${result.message || "Unknown error"}`, "danger");
                }
            } catch (err) {
                console.error(err);
                showToast("Network or server error while updating student.", "danger");
            }
        });
    }

    // ----------------------------
    // ✅ Toast Function
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
    // ✏️ Delete Student
    // ----------------------------
    document.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete-student");
        if (!deleteBtn) return;

        studentToDeleteId = deleteBtn.getAttribute("data-id");
        const student = allStudents.find(s => s.id == studentToDeleteId);
        const studentName = student ? student.full_name : "this student";

        document.getElementById("deleteStudentMessage").textContent = 
            `Are you sure you want to delete "${studentName}"? This will also remove their attendance and fees records.`;

        new bootstrap.Modal(document.getElementById("deleteStudentModal")).show();
    });

    const confirmDeleteBtn = document.getElementById("confirmDeleteStudentBtn");
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", async () => {
            if (!studentToDeleteId) return;

            try {
                const res = await fetch("../php/delete_student.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: studentToDeleteId })
                });
                const result = await res.json();
                if (result.status === "success") {
                    showToast("Student deleted successfully ✅", "success");
                    await loadStudents();
                    loadAttendance();
                    loadFees();
                } else {
                    showToast(`Error deleting student: ${result.message || "Unknown error"}`, "danger");
                }
            } catch (err) {
                console.error(err);
                showToast("Network or server error while deleting student.", "danger");
            }

            const modalInstance = bootstrap.Modal.getInstance(document.getElementById("deleteStudentModal"));
            modalInstance.hide();
            studentToDeleteId = null;
        });
    }

    // ----------------------------
    // 🗓 Attendance Table
    // ----------------------------
    async function loadAttendance() {
        if (!attendanceTableBody) return;

        attendanceTableBody.innerHTML = `<tr><td colspan="4" class="text-muted py-3">Loading...</td></tr>`;

        const students = await fetchStudents();
        const selectedClass = classSelect.value;
        const filtered = students.filter(s => s.class_name === selectedClass);

        if (!filtered.length) {
            attendanceTableBody.innerHTML = `<tr><td colspan="4" class="text-muted py-3">No students in this class.</td></tr>`;
            return;
        }

        // ✅ Pass class_name + date now
        const date = selectedAttendanceDate.toISOString().split("T")[0];
        const attendanceMap = await fetchAttendanceByDate(selectedClass, date);

        attendanceTableBody.innerHTML = filtered.map((student, index) => {
            const status = attendanceMap[student.id] || "–";
            let badgeClass = "text-bg-secondary";
            if (status === "Present") badgeClass = "text-bg-success";
            if (status === "Absent") badgeClass = "text-bg-danger";

            return `
                <tr data-id="${student.id}">
                    <td>${index + 1}</td>
                    <td>${student.full_name}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm btn-edit-attendance" data-id="${student.id}">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }




    async function fetchAttendanceByDate(className, date) {
        try {
            const res = await fetch(`../php/get_attendance.php?class_name=${encodeURIComponent(className)}&date=${encodeURIComponent(date)}`);
            const data = await res.json();
            // Expect format: [{ student_id: "5", status: "Present" }, ...]
            const map = {};
            data.forEach(rec => (map[rec.student_id] = rec.status));
            return map;
        } catch (err) {
            console.error(err);
            return {};
        }
    }





    // ----------------------------
    // ✨ Next Class Date / Custom Calendar
    // ----------------------------
    function getNextClassDate(className) {
        const today = new Date();
        let targetDay = className.toLowerCase().includes("friday") ? 5 : 4; // Thursday=4, Friday=5
        const dayDiff = (targetDay + 7 - today.getDay()) % 7 || 7;
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + dayDiff);
        return nextDate;
    }

    function renderCalendar(date, allowedWeekday) {
        if (!calendarContainer) return;
        calendarContainer.innerHTML = "";

        const year = date.getFullYear();
        const month = date.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();

        for (let d = 1; d <= lastDay; d++) {
            const current = new Date(Date.UTC(year, month, d));
            const btn = document.createElement("button");
            btn.className = "btn btn-sm rounded";
            btn.textContent = d;

            if (current.getDay() !== allowedWeekday) {
                btn.disabled = true;
                btn.classList.add("btn-secondary");
            } else {
                btn.classList.add("btn-outline-primary");

                // Check if this is the currently selected date → keep highlighted
                if (
                    selectedAttendanceDate &&
                    current.toISOString().split("T")[0] === selectedAttendanceDate.toISOString().split("T")[0]
                ) {
                    btn.classList.remove("btn-outline-primary");
                    btn.classList.add("selected-date-btn");
                }

                btn.addEventListener("click", () => {
                    selectedAttendanceDate = current;
                    selectedDateEl.textContent = current.toISOString().split("T")[0];

                    // Remove highlight from all buttons
                    calendarContainer.querySelectorAll("button").forEach(b => {
                        b.classList.remove("selected-date-btn");
                        if (!b.disabled) {
                            b.classList.add("btn-outline-primary");
                        }
                    });

                    // Highlight the clicked button
                    btn.classList.remove("btn-outline-primary");
                    btn.classList.add("selected-date-btn");

                    // ✅ Reload status for selected date
                    loadAttendance();
                });
            }

            calendarContainer.appendChild(btn);
        }
    }


    // Show next class date & calendar on button click
    if (nextClassBtn) {
        nextClassBtn.addEventListener("click", () => {
            isCalendarVisible = !isCalendarVisible; // toggle

            if (isCalendarVisible) {
                // Show calendar
                selectedAttendanceDate = getNextClassDate(classSelect.value);
                selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
                const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
                renderCalendar(selectedAttendanceDate, weekday);
                calendarContainer.style.display = "flex";
            } else {
                // Hide calendar
                calendarContainer.innerHTML = "";
                calendarContainer.style.display = "none";
                selectedDateEl.textContent = ""; // optional: clear date too
            }
        });
    }


    // Update calendar & date automatically when switching classes
    if (classSelect) {
        classSelect.addEventListener("change", () => {
            loadAttendance();

            selectedAttendanceDate = getNextClassDate(classSelect.value);
            selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];

            const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
            renderCalendar(selectedAttendanceDate, weekday);
        });
    }


    // ----------------------------
    // ✏️ Edit Attendance Modal
    // ----------------------------
    document.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".btn-edit-attendance");
        if (!editBtn) return;

        selectedStudentId = editBtn.dataset.id;
        const student = allStudents.find(s => s.id == selectedStudentId);
        if (!student) return;

        studentNameEl.textContent = student.full_name;
        selectedAttendanceDate = getNextClassDate(student.class_name);
        selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
        const weekday = student.class_name.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday);

        attendanceModal.show();
    });

    async function markAttendance(status) {
        if (!selectedStudentId || !selectedAttendanceDate) return;

        const formData = new FormData();
        formData.append("student_id", selectedStudentId);
        formData.append("status", status);
        formData.append("date", selectedAttendanceDate.toISOString().split("T")[0]);

        try {
            const res = await fetch("../php/mark_attendance.php", { method: "POST", body: formData });
            const result = await res.json();
            if (result.status === "success") {
                showToast(`Attendance marked ${status}`, "success");
                attendanceModal.hide();
                loadAttendance();
            } else {
                showToast(result.message || "Error marking attendance", "danger");
            }
        } catch (err) {
            console.error(err);
            showToast("Network error marking attendance", "danger");
        }
    }

    if (markPresentBtn) markPresentBtn.addEventListener("click", () => markAttendance("Present"));
    if (markAbsentBtn) markAbsentBtn.addEventListener("click", () => markAttendance("Absent"));

    // ----------------------------
    // 💰 Fees Table
    // ----------------------------
    function changeMonth(direction) {
        if (!feesMonthInput) return;
        const [year, month] = feesMonthInput.value.split("-").map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
        feesMonthInput.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        loadFees();
    }

    if (prevMonthBtn) prevMonthBtn.addEventListener("click", () => changeMonth("prev"));
    if (nextMonthBtn) nextMonthBtn.addEventListener("click", () => changeMonth("next"));

    async function loadFees() {
        if (!feesTableBody) return;
        feesTableBody.innerHTML = `<tr><td colspan="5" class="text-muted">Loading...</td></tr>`;

        const students = await fetchStudents();
        if (!students.length) {
            feesTableBody.innerHTML = `<tr><td colspan="5" class="text-muted">No students found.</td></tr>`;
            return;
        }

        const currentMonth = feesMonthInput ? feesMonthInput.value : new Date().toISOString().slice(0, 7);

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

    // ----------------------------
    // Initial Load
    // ----------------------------
    loadAttendance();
    loadFees();
});
