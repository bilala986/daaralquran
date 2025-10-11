document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const attendanceTableBody = document.getElementById("attendanceTableBody");
    const classSelect = document.getElementById("attendanceClassSelect");
    const nextClassBtn = document.getElementById("nextClassBtn");
    const selectedDateEl = document.getElementById("selectedDate");
    const calendarContainer = document.getElementById("calendarContainer");

    // Modal elements
    const attendanceModalEl = document.getElementById("attendanceModal");
    const attendanceModal = new bootstrap.Modal(attendanceModalEl);
    const studentNameEl = document.getElementById("studentName");
    const selectedAttendanceDateEl = document.getElementById("selectedAttendanceDate");
    const attendanceCalendar = document.getElementById("attendanceCalendar");
    const markPresentBtn = document.getElementById("markPresent");
    const markAbsentBtn = document.getElementById("markAbsent");

    // Top controls
    const searchInput = document.getElementById("attendanceSearchInput");
    const refreshBtn = document.getElementById("attendanceRefreshBtn");
    const filterBtn = document.getElementById("attendanceFilterBtn");

    // Filter modal elements
    const filterModalEl = document.getElementById("attendanceFilterModal");
    const filterModal = new bootstrap.Modal(filterModalEl);
    const filterClassSelect = document.getElementById("attendanceFilterClass");
    const filterStatusSelect = document.getElementById("attendanceFilterStatus");
    const applyFiltersBtn = document.getElementById("attendanceApplyFilters");
    const clearFiltersBtn = document.getElementById("attendanceClearFilters");

    let allStudents = [];
    let selectedAttendanceDate = null;
    let isCalendarVisible = false;
    let selectedStudentId = null;

    // --- Helper functions ---
    async function fetchStudents() {
        try {
            const res = await fetch("../php/get_students.php");
            if (!res.ok) throw new Error("Server error");
            allStudents = await res.json();
            return allStudents;
        } catch (err) {
            console.error("fetchStudents:", err);
            allStudents = [];
            return [];
        }
    }

    async function fetchAttendanceByClassAndDate(className, dateStr) {
        try {
            const url = `../php/get_attendance.php?class_name=${encodeURIComponent(className)}&date=${encodeURIComponent(dateStr)}`;
            const res = await fetch(url);
            if (!res.ok) return {};
            const data = await res.json();
            const map = {};
            data.forEach(r => { map[r.student_id] = r.status; });
            return map;
        } catch (err) {
            console.error("fetchAttendanceByClassAndDate:", err);
            return {};
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getNextClassDate(className) {
        const today = new Date();
        const targetDay = className.toLowerCase().includes("friday") ? 5 : 4; // Thu=4, Fri=5
        let dayDiff = (targetDay + 7 - today.getDay()) % 7;
        if (dayDiff === 0) dayDiff = 7;
        return new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayDiff);
    }

    // --- Render functions ---
    function renderCalendar(date, allowedWeekday, container = calendarContainer, onSelect) {
        if (!container) return;
        container.innerHTML = "";

        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0).getDate();

        for (let d = 1; d <= lastDay; d++) {
            const current = new Date(year, month, d);
            const btn = document.createElement("button");
            btn.className = "btn btn-sm rounded";
            btn.textContent = d;

            if (current.getDay() !== allowedWeekday) {
                btn.disabled = true;
                btn.classList.add("btn-secondary");
            } else {
                btn.classList.add("btn-outline-primary");
                const curIso = current.toISOString().split("T")[0];
                const selIso = selectedAttendanceDate ? selectedAttendanceDate.toISOString().split("T")[0] : null;
                if (selIso && curIso === selIso) {
                    btn.classList.remove("btn-outline-primary");
                    btn.classList.add("selected-date-btn");
                }

                btn.addEventListener("click", () => {
                    selectedAttendanceDate = new Date(year, month, d);
                    selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
                    if (onSelect) onSelect(selectedAttendanceDate);

                    container.querySelectorAll("button").forEach(b => {
                        b.classList.remove("selected-date-btn");
                        if (!b.disabled) b.classList.add("btn-outline-primary");
                    });
                    btn.classList.remove("btn-outline-primary");
                    btn.classList.add("selected-date-btn");

                    loadAttendance();
                });
            }
            container.appendChild(btn);
        }
    }

    // --- Main attendance loader ---
    async function loadAttendance() {
        if (!attendanceTableBody) return;
        attendanceTableBody.innerHTML = `<tr><td colspan="4" class="text-muted py-3">Loading...</td></tr>`;

        await fetchStudents();
        const className = classSelect.value;
        if (!selectedAttendanceDate) selectedAttendanceDate = getNextClassDate(className);
        const dateStr = selectedAttendanceDate.toISOString().split("T")[0];
        const attendanceMap = await fetchAttendanceByClassAndDate(className, dateStr);

        // Filter students by class
        let students = allStudents.filter(s => s.class_name === className);

        // Apply search filter
        const q = searchInput?.value.trim().toLowerCase();
        if (q) {
            students = students.filter(s => s.full_name.toLowerCase().includes(q));
        }

        // Apply modal filters
        const filterClassVal = filterClassSelect?.value;
        const filterStatusVal = filterStatusSelect?.value;
        if (filterClassVal) students = students.filter(s => s.class_name === filterClassVal);
        if (filterStatusVal) students = students.filter(s => (attendanceMap[s.id] || "–") === filterStatusVal);

        if (!students.length) {
            attendanceTableBody.innerHTML = `<tr><td colspan="4" class="text-muted py-3">No students found.</td></tr>`;
            return;
        }

        attendanceTableBody.innerHTML = students.map((s, i) => {
            const status = attendanceMap[s.id] || "–";
            let badgeClass = "text-bg-secondary";
            if (status === "Present") badgeClass = "text-bg-success";
            if (status === "Absent") badgeClass = "text-bg-danger";

            return `
                <tr data-id="${s.id}">
                    <td>${i + 1}</td>
                    <td>${escapeHtml(s.full_name)}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm btn-edit-attendance" data-id="${s.id}">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // --- Event handlers ---
    nextClassBtn.addEventListener("click", () => {
        isCalendarVisible = !isCalendarVisible;
        if (isCalendarVisible) {
            selectedAttendanceDate = getNextClassDate(classSelect.value);
            selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
            const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
            renderCalendar(selectedAttendanceDate, weekday);
            calendarContainer.style.display = "flex";
        } else {
            calendarContainer.style.display = "none";
        }
    });

    classSelect.addEventListener("change", () => {
        selectedAttendanceDate = getNextClassDate(classSelect.value);
        selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
        const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday);
        calendarContainer.style.display = isCalendarVisible ? "flex" : "none";
        loadAttendance();
    });

    // Delegated click: open modal
    document.addEventListener("click", (e) => {
        const el = e.target.closest(".btn-edit-attendance");
        if (!el) return;
        selectedStudentId = el.dataset.id;
        const stu = allStudents.find(s => s.id == selectedStudentId);
        if (!stu) return;

        studentNameEl.textContent = stu.full_name;
        if (!selectedAttendanceDate) selectedAttendanceDate = getNextClassDate(stu.class_name);
        selectedAttendanceDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];

        const weekday = stu.class_name.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday, attendanceCalendar, (newDate) => {
            selectedAttendanceDateEl.textContent = newDate.toISOString().split("T")[0];
        });

        attendanceModal.show();
    });

    async function markAttendance(status) {
        if (!selectedStudentId || !selectedAttendanceDate) return;
        const dateStr = selectedAttendanceDate.toISOString().split("T")[0];

        const formData = new FormData();
        formData.append("student_id", selectedStudentId);
        formData.append("status", status);
        formData.append("date", dateStr);

        try {
            const res = await fetch("../php/mark_attendance.php", { method: "POST", body: formData });
            const json = await res.json();
            if (json.status === "success") {
                showToast(`Marked ${status}`, "success");
                attendanceModal.hide();
                await loadAttendance();
            } else {
                showToast(json.message || "Error", "danger");
            }
        } catch (err) {
            console.error("markAttendance:", err);
            showToast("Network error", "danger");
        }
    }

    if (markPresentBtn) markPresentBtn.addEventListener("click", () => markAttendance("Present"));
    if (markAbsentBtn) markAbsentBtn.addEventListener("click", () => markAttendance("Absent"));

    // --- Search & Filter ---
    if (searchInput) {
        searchInput.addEventListener("input", loadAttendance);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            searchInput.value = "";
            filterClassSelect.value = "";
            filterStatusSelect.value = "";
            loadAttendance();
        });
    }

    if (filterBtn) {
        filterBtn.addEventListener("click", () => filterModal.show());
    }

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", () => {
            loadAttendance();
            filterModal.hide();
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            filterClassSelect.value = "";
            filterStatusSelect.value = "";
            loadAttendance();
        });
    }

    function showToast(msg, type = "success") {
        const div = document.createElement("div");
        div.className = "position-fixed bottom-0 end-0 p-3";
        div.innerHTML = `
            <div class="toast align-items-center text-bg-${type} border-0 show" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${msg}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3200);
    }

    // --- Init ---
    (async function init() {
        selectedAttendanceDate = getNextClassDate(classSelect.value);
        selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
        const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday);
        calendarContainer.style.display = "none";
        await loadAttendance();
    })();
});
