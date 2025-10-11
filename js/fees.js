// ----------------------------
// 💰 Fees Table
// ----------------------------

// Elements
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const feesMonthInput = document.getElementById("feesMonth");
const feesTableBody = document.getElementById("feesTableBody");

// Change Month
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

// Load Fees Table
async function loadFees() {
    if (!feesTableBody) return;
    feesTableBody.innerHTML = `<tr><td colspan="5" class="text-muted">Loading...</td></tr>`;

    const students = await fetchStudents();
    if (!students.length) {
        feesTableBody.innerHTML = `<tr><td colspan="5" class="text-muted">No students found.</td></tr>`;
        return;
    }

    const currentMonth = feesMonthInput ? feesMonthInput.value : new Date().toISOString().slice(0, 7);

    feesTableBody.innerHTML = students
        .map((student, index) => `
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
        `)
        .join("");
}

// Init
document.addEventListener("DOMContentLoaded", loadFees);
