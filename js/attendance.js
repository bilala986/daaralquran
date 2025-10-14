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
    const filterModal = filterModalEl ? new bootstrap.Modal(filterModalEl) : null;
    const filterStatusSelect = document.getElementById("attendanceFilterStatus");
    const applyFiltersBtn = document.getElementById("attendanceApplyFilters");
    const clearFiltersBtn = document.getElementById("attendanceClearFilters");

    let allStudents = [];
    let selectedAttendanceDate = null;
    let isCalendarVisible = false;

    // Track pending changes: { studentId: "Present" | "Absent" }
    let pendingChanges = {};

    // --- Helpers ---
    function pad(n) { return String(n).padStart(2, "0"); }

    // returns "YYYY-MM-DD" (safe, no timezone conversion)
    function toISODateLocal(d) {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    // returns "DD/MM/YYYY" for display
    function toDisplayDate(d) {
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    }

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

    // --- Calendar renderer (grid) with month header + formatted date ---
    function renderCalendar(date, allowedWeekday, container = calendarContainer, onSelect) {
        if (!container) return;
        container.innerHTML = "";

        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
        const lastDay = new Date(year, month + 1, 0).getDate();

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // === Top bar with Prev / Month Name / Next ===
        const topBar = document.createElement("div");
        topBar.className = "d-flex justify-content-center align-items-center mb-2";
        topBar.style.gap = "10px";
        topBar.style.fontWeight = "600";
        topBar.style.fontSize = "16px";

        // Prev button
        const prevBtn = document.createElement("span");
        prevBtn.textContent = "◀";
        prevBtn.style.cursor = "pointer";
        prevBtn.addEventListener("click", () => {
            const newDate = new Date(year, month - 1, 1);
            renderCalendar(newDate, allowedWeekday, container, onSelect);
        });
        topBar.appendChild(prevBtn);

        // Month name
        const monthLabel = document.createElement("span");
        monthLabel.textContent = `${monthNames[month]} ${year}`;
        topBar.appendChild(monthLabel);

        // Next button
        const nextBtn = document.createElement("span");
        nextBtn.textContent = "▶";
        nextBtn.style.cursor = "pointer";
        nextBtn.addEventListener("click", () => {
            const newDate = new Date(year, month + 1, 1);
            renderCalendar(newDate, allowedWeekday, container, onSelect);
        });
        topBar.appendChild(nextBtn);

        container.appendChild(topBar);

        // === Weekday labels ===
        const header = document.createElement("div");
        header.className = "d-flex justify-content-center mb-2";
        header.style.gap = "6px";
        const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];
        weekdayLabels.forEach(lbl => {
            const h = document.createElement("div");
            h.textContent = lbl;
            h.style.width = "42px";
            h.style.textAlign = "center";
            h.style.fontWeight = "600";
            header.appendChild(h);
        });
        container.appendChild(header);

        // === Grid ===
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(7, 42px)";
        grid.style.gridAutoRows = "42px";
        grid.style.justifyContent = "center";
        grid.style.gap = "6px";
        grid.style.padding = "6px";
        grid.style.background = "transparent";

        const offset = (firstDay === 0 ? 6 : firstDay - 1);
        for (let i = 0; i < offset; i++) {
            const empty = document.createElement("div");
            empty.className = "calendar-empty";
            grid.appendChild(empty);
        }

        for (let d = 1; d <= lastDay; d++) {
            const current = new Date(year, month, d);
            const dayCell = document.createElement("div");
            dayCell.className = "day-cell d-flex align-items-center justify-content-center";
            dayCell.textContent = d;
            dayCell.style.width = "42px";
            dayCell.style.height = "42px";
            dayCell.style.background = "#fff";
            dayCell.style.border = "1px solid #ddd";
            dayCell.style.borderRadius = "6px";
            dayCell.style.userSelect = "none";

            if (current.getDay() !== allowedWeekday) {
                dayCell.style.opacity = "0.45";
                dayCell.style.cursor = "not-allowed";
            } else {
                dayCell.style.cursor = "pointer";
                dayCell.addEventListener("click", () => {
                    selectedAttendanceDate = new Date(year, month, d);
                    selectedDateEl.textContent = formatHumanDate(selectedAttendanceDate);

                    if (onSelect) onSelect(selectedAttendanceDate);

                    container.querySelectorAll(".day-cell").forEach(c => {
                        c.style.border = "1px solid #ddd";
                        c.style.boxShadow = "none";
                    });
                    dayCell.style.border = "2px solid #0d6efd";
                    dayCell.style.boxShadow = "0 0 0 3px rgba(13,110,253,0.06)";

                    loadAttendance();
                });
            }

            if (
                selectedAttendanceDate &&
                selectedAttendanceDate.getFullYear() === year &&
                selectedAttendanceDate.getMonth() === month &&
                selectedAttendanceDate.getDate() === d
            ) {
                dayCell.style.border = "2px solid #0d6efd";
                dayCell.style.boxShadow = "0 0 0 3px rgba(13,110,253,0.06)";
            }

            grid.appendChild(dayCell);
        }

        container.appendChild(grid);

        container.style.display = "block";
        container.style.margin = "0 auto";
        container.style.maxWidth = "336px";
        container.style.background = "transparent";
    }


    // Helper: 17th September 2025
    function formatHumanDate(d) {
        const day = d.getDate();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const year = d.getFullYear();

        const suffix = (n) => {
            if (n >= 11 && n <= 13) return "th";
            switch (n % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        return `${day}${suffix(day)} ${monthNames[d.getMonth()]} ${year}`;
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

        // ensure selectedDate element displays correctly
        selectedDateEl.textContent = toDisplayDate(selectedAttendanceDate);

        const dateStrForApi = toISODateLocal(selectedAttendanceDate); // YYYY-MM-DD
        const attendanceMap = await fetchAttendanceByClassAndDate(className, dateStrForApi);

        // Filter students by class
        let students = allStudents.filter(s => s.class_name === className);

        // Search filter
        const q = searchInput?.value.trim().toLowerCase();
        if (q) students = students.filter(s => s.full_name.toLowerCase().includes(q));

        // Status filter (modal)
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
            selectedDateEl.textContent = toDisplayDate(selectedAttendanceDate);
            const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
            renderCalendar(selectedAttendanceDate, weekday);
            calendarContainer.style.display = "block";
        } else {
            calendarContainer.style.display = "none";
        }
    });

    classSelect?.addEventListener("change", () => {
        // When changing class, hide calendar (preserve previous visibility behavior)
        selectedAttendanceDate = getNextClassDate(classSelect.value);
        selectedDateEl.textContent = toDisplayDate(selectedAttendanceDate);
        const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday);
        calendarContainer.style.display = isCalendarVisible ? "block" : "none";
        loadAttendance();
    });

    // Delegated click handler for Present/Absent
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

    // Top Save button
    saveBtn?.addEventListener("click", async () => {
        const entries = Object.entries(pendingChanges);
        if (!entries.length) return;

        try {
            for (const [studentId, status] of entries) {
                const formData = new FormData();
                formData.append("student_id", studentId);
                formData.append("status", status);

                // send YYYY-MM-DD (no timezone conversion)
                formData.append("date", toISODateLocal(selectedAttendanceDate));

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

    // Search & Filter
    searchInput?.addEventListener("input", loadAttendance);
    refreshBtn?.addEventListener("click", () => {
        searchInput.value = "";
        if (filterStatusSelect) filterStatusSelect.value = "";
        loadAttendance();
    });
    filterBtn?.addEventListener("click", () => filterModal?.show());
    applyFiltersBtn?.addEventListener("click", () => {
        loadAttendance();
        filterModal?.hide();
    });
    clearFiltersBtn?.addEventListener("click", () => {
        if (filterStatusSelect) filterStatusSelect.value = "";
        loadAttendance();
        filterModal?.hide();
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

    // Init
    (async function init() {
        selectedAttendanceDate = getNextClassDate(classSelect.value);
        selectedDateEl.textContent = toDisplayDate(selectedAttendanceDate);
        const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday);
        calendarContainer.style.display = "none";
        await loadAttendance();
    })();
});
