document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const attendanceTableBody = document.getElementById("attendanceTableBody");
    const classSelect = document.getElementById("attendanceClassSelect");
    const nextClassBtn = document.getElementById("nextClassBtn");
    const selectedDateEl = document.getElementById("selectedDate");
    const calendarContainer = document.getElementById("calendarContainer");

    // Top controls
    const searchInput = document.getElementById("attendanceSearchInput");
    const refreshBtn = document.getElementById("attendanceRefreshBtn");
    const filterBtn = document.getElementById("attendanceFilterBtn");
    const saveBtn = document.getElementById("attendanceSaveBtn"); // Top Save button

    // Filter modal elements
    const filterModalEl = document.getElementById("attendanceFilterModal");
    const filterModal = new bootstrap.Modal(filterModalEl);
    const filterStatusSelect = document.getElementById("attendanceFilterStatus");
    const applyFiltersBtn = document.getElementById("attendanceApplyFilters");
    const clearFiltersBtn = document.getElementById("attendanceClearFilters");

    let allStudents = [];
    let selectedAttendanceDate = null;
    let isCalendarVisible = false;

    // Track pending changes: { studentId: "Present" | "Absent" }
    let pendingChanges = {};

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
        pendingChanges = {};
        if (saveBtn) saveBtn.disabled = true;

        await fetchStudents();
        const className = classSelect.value;
        if (!selectedAttendanceDate) selectedAttendanceDate = getNextClassDate(className);
        const dateStr = selectedAttendanceDate.toISOString().split("T")[0];
        const attendanceMap = await fetchAttendanceByClassAndDate(className, dateStr);

        // Filter students by class
        let students = allStudents.filter(s => s.class_name === className);

        // Search filter
        const q = searchInput?.value.trim().toLowerCase();
        if (q) students = students.filter(s => s.full_name.toLowerCase().includes(q));

        // Status filter
        const filterStatusVal = filterStatusSelect?.value;
        if (filterStatusVal) students = students.filter(s => (attendanceMap[s.id] || "–") === filterStatusVal);

        if (!students.length) {
            attendanceTableBody.innerHTML = `<tr><td colspan="4" class="text-muted py-3">No students found.</td></tr>`;
            return;
        }

        attendanceTableBody.innerHTML = students.map((s, i) => {
            const status = attendanceMap[s.id] || "–";
            return `
                <tr data-id="${s.id}">
                    <td>${i + 1}</td>
                    <td>${escapeHtml(s.full_name)}</td>
                    <td>
                        <span class="badge ${status === "Present" ? "text-bg-success" : status === "Absent" ? "text-bg-danger" : "text-bg-secondary"}">
                            ${status}
                        </span>
                    </td>
                    <td>
                        <div class="d-flex gap-2 justify-content-center">
                            <button class="btn btn-sm btn-outline-success btn-attendance-toggle" data-status="Present">Present</button>
                            <button class="btn btn-sm btn-outline-danger btn-attendance-toggle" data-status="Absent">Absent</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // --- Event handlers ---
    nextClassBtn?.addEventListener("click", () => {
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

    classSelect?.addEventListener("change", () => {
        selectedAttendanceDate = getNextClassDate(classSelect.value);
        selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
        const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday);
        calendarContainer.style.display = isCalendarVisible ? "flex" : "none";
        loadAttendance();
    });

    // --- Delegated click handler for Present/Absent ---
    document.addEventListener("click", (e) => {
        const toggleBtn = e.target.closest(".btn-attendance-toggle");
        if (!toggleBtn) return;

        const row = toggleBtn.closest("tr");
        const presentBtn = row.querySelector('button[data-status="Present"]');
        const absentBtn = row.querySelector('button[data-status="Absent"]');
        const studentId = row.dataset.id;

        if (toggleBtn.dataset.status === "Present") {
            presentBtn.classList.remove("btn-outline-success");
            presentBtn.classList.add("btn-success");
            absentBtn.classList.remove("btn-danger");
            absentBtn.classList.add("btn-outline-danger");
            pendingChanges[studentId] = "Present";
        } else {
            absentBtn.classList.remove("btn-outline-danger");
            absentBtn.classList.add("btn-danger");
            presentBtn.classList.remove("btn-success");
            presentBtn.classList.add("btn-outline-success");
            pendingChanges[studentId] = "Absent";
        }

        if (saveBtn) saveBtn.disabled = false;
    });

    // --- Top Save button ---
    saveBtn?.addEventListener("click", async () => {
        const entries = Object.entries(pendingChanges);
        if (!entries.length) return;

        try {
            for (const [studentId, status] of entries) {
                const formData = new FormData();
                formData.append("student_id", studentId);
                formData.append("status", status);
                formData.append("date", selectedAttendanceDate.toISOString().split("T")[0]);

                const res = await fetch("../php/mark_attendance.php", { method: "POST", body: formData });
                const json = await res.json();
                if (json.status !== "success") {
                    showToast(`Failed to save ${studentId}`, "danger");
                }
            }

            showToast("All changes saved!", "success");

            // Update badges and reset buttons
            for (const [studentId, status] of entries) {
                const row = attendanceTableBody.querySelector(`tr[data-id="${studentId}"]`);
                if (!row) continue;

                const badge = row.querySelector("td:nth-child(3) span");
                badge.textContent = status;
                badge.className = `badge ${status === "Present" ? "text-bg-success" : "text-bg-danger"}`;

                const presentBtn = row.querySelector('button[data-status="Present"]');
                const absentBtn = row.querySelector('button[data-status="Absent"]');
                presentBtn.classList.remove("btn-success");
                presentBtn.classList.add("btn-outline-success");
                absentBtn.classList.remove("btn-danger");
                absentBtn.classList.add("btn-outline-danger");
            }

            pendingChanges = {};
            if (saveBtn) saveBtn.disabled = true;
        } catch (err) {
            console.error(err);
            showToast("Network error", "danger");
        }
    });

    // --- Search & Filter ---
    searchInput?.addEventListener("input", loadAttendance);
    refreshBtn?.addEventListener("click", () => {
        searchInput.value = "";
        filterStatusSelect.value = "";
        loadAttendance();
    });
    filterBtn?.addEventListener("click", () => filterModal.show());
    applyFiltersBtn?.addEventListener("click", () => {
        loadAttendance();
        filterModal.hide();
    });
    clearFiltersBtn?.addEventListener("click", () => {
        filterStatusSelect.value = "";
        loadAttendance();
        filterModal.hide();
    });

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
