document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const feesTableBody = document.getElementById("feesTableBody");
    const classSelect = document.getElementById("feesClassSelect");
    const monthContainer = document.getElementById("feesMonthContainer");
    const selectedMonthText = document.getElementById("selectedMonthText");
    const searchInput = document.getElementById("feesSearchInput");
    const refreshBtn = document.getElementById("feesRefreshBtn");
    const saveBtn = document.getElementById("feesSaveBtn");

    // Filter modal elements
    const feesFilterBtn = document.getElementById("feesFilterBtn");
    const feesStatusFilter = document.getElementById("feesStatusFilter");
    const feesApplyFilters = document.getElementById("applyFeesFilter");
    const feesClearFilters = document.getElementById("clearFeesFilter");

    let statusFilter = ""; // "" = all, "Paid" | "Unpaid" | "Pending"
    let allStudents = [];
    let selectedMonth = null;
    let pendingChanges = {}; // { studentId: "Paid" | "Unpaid" }

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
        const now = new Date();
        const currentMonth = now.getMonth();

        monthNames.forEach((name, idx) => {
            const btn = document.createElement("button");
            btn.textContent = name;
            btn.className = "btn btn-sm btn-outline-primary month-btn";
            if (idx === currentMonth) {
                btn.classList.add("selected-month-btn");
                selectedMonth = idx;
                selectedMonthText.textContent = name;
            }

            btn.addEventListener("click", () => {
                selectedMonth = idx;
                selectedMonthText.textContent = name;

                // Deselect all buttons
                monthContainer.querySelectorAll("button").forEach(b => {
                    b.classList.remove("selected-month-btn");
                    b.classList.add("btn-outline-primary");
                });
                btn.classList.remove("btn-outline-primary");
                btn.classList.add("selected-month-btn");

                // Reset filter when changing month
                statusFilter = "";
                feesStatusFilter.value = "";

                loadFees();
            });

            monthContainer.appendChild(btn);
        });
    }


    // --- Fetch fees data ---
    async function fetchFees(className, month) {
        try {
            const url = `../php/get_fees.php?class_name=${encodeURIComponent(className)}&month=${month+1}`;
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

        const feesMap = await fetchFees(className, selectedMonth);

        let students = allStudents.filter(s => s.class_name === className);

        // Search filter
        const q = searchInput.value.trim().toLowerCase();
        if (q) students = students.filter(s => s.full_name.toLowerCase().includes(q));

        // Status filter
        if (statusFilter) {
            students = students.filter(s => {
                const currentStatus = feesMap[s.id] || "Pending";
                return currentStatus === statusFilter;
            });
        }

        if (!students.length) {
            feesTableBody.innerHTML = `<tr><td colspan="5" class="text-muted py-3">No students found.</td></tr>`;
            return;
        }

        const defaultFee = classFees[className] || 0;

        feesTableBody.innerHTML = students.map((s, i) => {
            const status = feesMap[s.id] || "Pending";
            let badgeClass = "text-bg-secondary"; // grey for Pending
            if (status === "Paid") badgeClass = "text-bg-success";
            else if (status === "Unpaid") badgeClass = "text-bg-danger";

            return `
                <tr data-id="${s.id}">
                    <td>${i + 1}</td>
                    <td>${s.full_name}</td>
                    <td class="fw-semibold">£${defaultFee}</td>
                    <td>
                        <span class="badge ${badgeClass}">${status}</span>
                    </td>
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

    // --- Toggle Paid/Unpaid selection ---
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-fees-toggle");
        if (!btn) return;

        const row = btn.closest("tr");
        const studentId = row.dataset.id;
        const paidBtn = row.querySelector('button[data-status="Paid"]');
        const unpaidBtn = row.querySelector('button[data-status="Unpaid"]');

        if (btn.dataset.status === "Paid") {
            paidBtn.classList.remove("btn-outline-success");
            paidBtn.classList.add("btn-success");
            unpaidBtn.classList.remove("btn-danger");
            unpaidBtn.classList.add("btn-outline-danger");
            pendingChanges[studentId] = { status: "Paid" };
        } else {
            unpaidBtn.classList.remove("btn-outline-danger");
            unpaidBtn.classList.add("btn-danger");
            paidBtn.classList.remove("btn-success");
            paidBtn.classList.add("btn-outline-success");
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
                const amount = row.querySelector(".fw-semibold").textContent.replace("£", "");

                const formData = new FormData();
                formData.append("student_id", studentId);
                formData.append("status", data.status);
                formData.append("amount", amount);
                formData.append("month", selectedMonth + 1);

                const res = await fetch("../php/mark_fees.php", { method: "POST", body: formData });
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

    // --- Search and refresh ---
    searchInput.addEventListener("input", loadFees);
    refreshBtn.addEventListener("click", () => {
        searchInput.value = "";
        loadFees();
    });

    // --- Filter modal ---
    const feesModal = new bootstrap.Modal(document.getElementById("feesFilterModal"));

    feesFilterBtn.addEventListener("click", () => {
        feesModal.show();
    });

    feesApplyFilters.addEventListener("click", () => {
        statusFilter = feesStatusFilter.value;
        loadFees();
        feesModal.hide();
    });

    feesClearFilters.addEventListener("click", () => {
        statusFilter = "";
        feesStatusFilter.value = "";
        loadFees();
        feesModal.hide();
    });

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

    // --- Init ---
    renderMonthButtons();
    loadFees();
    classSelect.addEventListener("change", loadFees);
});
