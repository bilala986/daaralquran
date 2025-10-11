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

    let allStudents = [];
    let selectedAttendanceDate = null; // Date object
    let isCalendarVisible = false;
    let selectedStudentId = null;

    // Helper: fetch students
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

    // Helper: fetch attendance for a class + date -> returns map student_id => status
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

    // Load attendance table for currently selected class & date
    async function loadAttendance() {
        if (!attendanceTableBody) return;
        attendanceTableBody.innerHTML = `<tr><td colspan="4" class="text-muted py-3">Loading...</td></tr>`;

        await fetchStudents();
        const className = classSelect.value;
        // If no date selected, use next class date
        if (!selectedAttendanceDate) selectedAttendanceDate = getNextClassDate(className);

        const dateStr = selectedAttendanceDate.toISOString().split("T")[0];
        const attendanceMap = await fetchAttendanceByClassAndDate(className, dateStr);

        const students = allStudents.filter(s => s.class_name === className);
        if (!students.length) {
            attendanceTableBody.innerHTML = `<tr><td colspan="4" class="text-muted py-3">No students in this class.</td></tr>`;
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

    // Utility to escape HTML
    function escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Get next class date for className
    function getNextClassDate(className) {
        const today = new Date();
        const targetDay = className.toLowerCase().includes("friday") ? 5 : 4; // Thu=4, Fri=5
        let dayDiff = (targetDay + 7 - today.getDay()) % 7;
        if (dayDiff === 0) dayDiff = 7; // always next occurrence (not today)
        const next = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayDiff);
        return next;
    }

    // Render calendar for given month (date is a Date in that month). Only enable allowedWeekday.
    function renderCalendar(date, allowedWeekday, container = calendarContainer, onSelect) {
        if (!container) return;
        container.innerHTML = "";

        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0).getDate();

        for (let d = 1; d <= lastDay; d++) {
            const current = new Date(year, month, d); // local date (no UTC)
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
                    selectedAttendanceDate = new Date(year, month, d); // local date
                    selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
                    if (onSelect) onSelect(selectedAttendanceDate);

                    // highlight buttons
                    container.querySelectorAll("button").forEach(b => {
                        b.classList.remove("selected-date-btn");
                        if (!b.disabled) b.classList.add("btn-outline-primary");
                    });
                    btn.classList.remove("btn-outline-primary");
                    btn.classList.add("selected-date-btn");

                    // reload table for newly selected date
                    loadAttendance();
                });
            }

            container.appendChild(btn);
        }
    }

    // Toggle calendar visibility and render
    nextClassBtn.addEventListener("click", () => {
        isCalendarVisible = !isCalendarVisible;
        if (isCalendarVisible) {
            const cls = classSelect.value;
            selectedAttendanceDate = getNextClassDate(cls);
            selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
            const weekday = cls.toLowerCase().includes("friday") ? 5 : 4;
            renderCalendar(selectedAttendanceDate, weekday);
            calendarContainer.style.display = "flex";
        } else {
            calendarContainer.innerHTML = "";
            calendarContainer.style.display = "none";
        }
    });

    // When user changes class, reset date to next class date, re-render and load table
    classSelect.addEventListener("change", () => {
        selectedAttendanceDate = getNextClassDate(classSelect.value);
        selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
        const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday);
        calendarContainer.style.display = isCalendarVisible ? "flex" : "none";
        loadAttendance();
    });

    // Delegated click: open edit modal
    document.addEventListener("click", (e) => {
        const el = e.target.closest(".btn-edit-attendance");
        if (!el) return;
        selectedStudentId = el.dataset.id;
        const stu = allStudents.find(s => s.id == selectedStudentId);
        if (!stu) return;

        // Setup modal contents
        studentNameEl.textContent = stu.full_name;
        // ensure modal uses currently selectedAttendanceDate (or compute)
        if (!selectedAttendanceDate) selectedAttendanceDate = getNextClassDate(stu.class_name);
        selectedAttendanceDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];

        // Render small calendar inside modal (attendanceCalendar)
        const weekday = stu.class_name.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday, attendanceCalendar, (newDate) => {
            selectedAttendanceDateEl.textContent = newDate.toISOString().split("T")[0];
        });

        attendanceModal.show();
    });

    // Mark present/absent
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
                // small visual feedback (toast)
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

    // Simple toast (re-used)
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

    // initial state
    (async function init() {
        // initial selected class & date
        selectedAttendanceDate = getNextClassDate(classSelect.value);
        selectedDateEl.textContent = selectedAttendanceDate.toISOString().split("T")[0];
        // render calendar but keep it hidden initially
        const weekday = classSelect.value.toLowerCase().includes("friday") ? 5 : 4;
        renderCalendar(selectedAttendanceDate, weekday);
        calendarContainer.style.display = "none";
        await loadAttendance();
    })();
});
