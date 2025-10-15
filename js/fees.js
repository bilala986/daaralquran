document.addEventListener("DOMContentLoaded", () => {
    // --- Toast helper ---
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

    const feesTableBody = document.getElementById("feesTableBody");
    const classSelect = document.getElementById("feesClassSelect");
    const monthContainer = document.getElementById("feesMonthContainer");
    const selectedMonthText = document.getElementById("selectedMonthText");
    const currentYearText = document.getElementById("currentYearText");
    const toggleMonthsBtn = document.getElementById("toggleMonthsBtn");
    const prevYearBtn = document.getElementById("prevYearBtn");
    const nextYearBtn = document.getElementById("nextYearBtn");
    const searchInput = document.getElementById("feesSearchInput");
    const refreshBtn = document.getElementById("feesRefreshBtn");
    const saveBtn = document.getElementById("feesSaveBtn");

    let allStudents = [];
    let selectedMonth = null;
    let currentYear = new Date().getFullYear();
    let pendingChanges = {};
    let statusFilter = "";

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const classFees = {
        "Thursday Adults": 25,
        "Friday Kids": 25,
        "Friday Adults": 15
    };

    

    // --- Render month buttons ---
    function renderMonthButtons() {
        monthContainer.innerHTML = "";
        currentYearText.textContent = currentYear;

        monthNames.forEach((name, idx) => {
            const btn = document.createElement("button");
            btn.textContent = name;
            btn.className = "btn btn-sm btn-outline-primary month-btn";

            // Preselect only if current year and current month, or previously selected month exists for this year
            if (selectedMonth === null && currentYear === new Date().getFullYear() && idx === new Date().getMonth()) {
                selectedMonth = idx;
                btn.classList.add("selected-month-btn");
                selectedMonthText.textContent = name;
            } else if (idx === selectedMonth) {
                btn.classList.add("selected-month-btn");
            }

            btn.addEventListener("click", () => {
                selectedMonth = idx;
                selectedMonthText.textContent = name;

                // Deselect other buttons
                monthContainer.querySelectorAll("button").forEach(b => {
                    b.classList.remove("selected-month-btn");
                    b.classList.add("btn-outline-primary");
                });
                btn.classList.remove("btn-outline-primary");
                btn.classList.add("selected-month-btn");

                // Reset filters and UI changes
                statusFilter = "";
                pendingChanges = {};

                loadFees();
            });

            monthContainer.appendChild(btn);
        });
    }

    // --- Toggle month buttons visibility ---
    toggleMonthsBtn.addEventListener("click", () => {
        monthContainer.classList.toggle("hide-months");
    });



    // --- Year navigation ---
    prevYearBtn.addEventListener("click", () => {
        currentYear--;
        selectedMonth = null; // Reset month selection for new year
        renderMonthButtons();
        loadFees();
    });

    nextYearBtn.addEventListener("click", () => {
        currentYear++;
        selectedMonth = null; // Reset month selection for new year
        renderMonthButtons();
        loadFees();
    });

    // --- Fetch fees data ---
    async function fetchFees(className, month, year) {
        try {
            const url = `../php/get_fees.php?class_name=${encodeURIComponent(className)}&month=${month+1}&year=${year}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Server error");
            return await res.json();
        } catch (err) {
            console.error("fetchFees:", err);
            return {};
        }
    }

    // --- Render fees table ---
    async function loadFees() {
        if (!feesTableBody) return;
        feesTableBody.innerHTML = `<tr><td colspan="5" class="text-muted py-3">Loading...</td></tr>`;
        pendingChanges = {};
        saveBtn.disabled = true;

        allStudents = await fetchStudents();
        const className = classSelect.value;
        if (selectedMonth === null) selectedMonth = new Date().getMonth();

        const feesMap = await fetchFees(className, selectedMonth, currentYear);
        let students = allStudents.filter(s => s.class_name === className);

        const q = searchInput.value.trim().toLowerCase();
        if (q) students = students.filter(s => s.full_name.toLowerCase().includes(q));

        if (statusFilter) {
            students = students.filter(s => (feesMap[s.id] || "Pending") === statusFilter);
        }

        if (!students.length) {
            feesTableBody.innerHTML = `<tr><td colspan="5" class="text-muted py-3">No students found.</td></tr>`;
            return;
        }

        const defaultFee = classFees[className] || 0;

        feesTableBody.innerHTML = students.map((s, i) => {
            const status = feesMap[s.id] || "Pending";
            let badgeClass = status === "Paid" ? "text-bg-success" : status === "Unpaid" ? "text-bg-danger" : "text-bg-secondary";

            return `
                <tr data-id="${s.id}">
                    <td>${i+1}</td>
                    <td>${s.full_name}</td>
                    <td class="fw-semibold">£${defaultFee}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                    <td>
                        <div class="d-flex gap-2 justify-content-center">
                            <button class="btn btn-sm btn-outline-success btn-fees-toggle" data-status="Paid">Paid</button>
                            <button class="btn btn-sm btn-outline-danger btn-fees-toggle" data-status="Unpaid">Unpaid</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // --- Paid/Unpaid toggle ---
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-fees-toggle");
        if (!btn) return;

        const row = btn.closest("tr");
        const studentId = row.dataset.id;
        const paidBtn = row.querySelector('button[data-status="Paid"]');
        const unpaidBtn = row.querySelector('button[data-status="Unpaid"]');

        if (btn.dataset.status === "Paid") {
            paidBtn.classList.replace("btn-outline-success","btn-success");
            unpaidBtn.classList.replace("btn-danger","btn-outline-danger");
            pendingChanges[studentId] = { status: "Paid" };
        } else {
            unpaidBtn.classList.replace("btn-outline-danger","btn-danger");
            paidBtn.classList.replace("btn-success","btn-outline-success");
            pendingChanges[studentId] = { status: "Unpaid" };
        }
        saveBtn.disabled = false;
    });

    // --- Save changes ---
    saveBtn.addEventListener("click", async () => {
        const entries = Object.entries(pendingChanges);
        if (!entries.length) return;
        try {
            for (const [studentId, data] of entries) {
                const row = document.querySelector(`tr[data-id="${studentId}"]`);
                const amount = row.querySelector(".fw-semibold").textContent.replace("£","");

                const formData = new FormData();
                formData.append("student_id", studentId);
                formData.append("status", data.status);
                formData.append("amount", amount);
                formData.append("month", selectedMonth + 1); // ✅ month sent as number (1-12)
                formData.append("year", currentYear);       // ✅ year correctly added

                const res = await fetch("../php/mark_fees.php", {
                    method: "POST",
                    body: formData
                });
                const json = await res.json();
                if (json.status !== "success") {
                    showToast(`Failed to save ${studentId}`, "danger");
                }
            }
            showToast("All changes saved!", "success");
            pendingChanges = {};
            saveBtn.disabled = true;
            loadFees();
        } catch (err) {
            console.error(err);
            showToast("Network error", "danger");
        }
    });


    // --- Search / Refresh ---
    searchInput.addEventListener("input", loadFees);
    refreshBtn.addEventListener("click", () => { searchInput.value=""; loadFees(); });

    // --- Init ---
    renderMonthButtons();
    loadFees();
    classSelect.addEventListener("change", loadFees);
});
