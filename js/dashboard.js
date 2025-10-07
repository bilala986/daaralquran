document.addEventListener("DOMContentLoaded", () => {
    const prevBtn = document.getElementById("prevDate");
    const nextBtn = document.getElementById("nextDate");
    const dateInput = document.getElementById("attendanceDate");
    const classSelect = document.getElementById("classSelect");
    
    

    // Helper: get day offset based on class
    function getClassDayOffset() {
        const selected = classSelect.value;
        if (selected.includes("Thursday")) return 4; // Thursday = 4 (0=Sunday)
        if (selected.includes("Friday")) return 5; // Friday = 5
        return 4;
    }

    // Helper: add or subtract 7 days
    function changeWeek(direction) {
        let currentDate = new Date(dateInput.value);
        if (isNaN(currentDate)) currentDate = new Date();

        const offset = direction === "next" ? 7 : -7;
        currentDate.setDate(currentDate.getDate() + offset);

        dateInput.value = currentDate.toISOString().split("T")[0];
    }

    // Event listeners
    nextBtn.addEventListener("click", () => changeWeek("next"));
    prevBtn.addEventListener("click", () => changeWeek("prev"));

    // When class changes, align to the nearest next/prev correct weekday
    classSelect.addEventListener("change", () => {
        const selectedDay = getClassDayOffset();
        let date = new Date(dateInput.value);
        if (isNaN(date)) date = new Date();

        // Find next selected weekday
        while (date.getDay() !== selectedDay) {
            date.setDate(date.getDate() + 1);
        }

        dateInput.value = date.toISOString().split("T")[0];
    });
    
    
    
    const addButton = document.getElementById("addButton");
    const tabs = document.querySelectorAll('#dashboardTabs button[data-bs-toggle="tab"]');

    function updateAddButtonState(activeTabId) {
        if (activeTabId === "attendance" || activeTabId === "fees") {
            addButton.disabled = true;
            addButton.classList.add("disabled");
        } else {
            addButton.disabled = false;
            addButton.classList.remove("disabled");
        }
    }

    // Listen for tab changes
    tabs.forEach(tab => {
        tab.addEventListener("shown.bs.tab", (e) => {
            const targetId = e.target.getAttribute("data-bs-target").replace("#", "");
            updateAddButtonState(targetId);
        });
    });

    // Initialize correct state on page load
    const activeTab = document.querySelector('#dashboardTabs .nav-link.active');
    if (activeTab) {
        updateAddButtonState(activeTab.getAttribute("data-bs-target").replace("#", ""));
    }
    
    
    
    
    
    const feesMonthInput = document.getElementById("feesMonth");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");

    // Helper to change month
    function changeMonth(direction) {
        if (!feesMonthInput) return;

        const [year, month] = feesMonthInput.value.split("-").map(Number);
        const date = new Date(year, month - 1);

        // Adjust month
        if (direction === "next") {
            date.setMonth(date.getMonth() + 1);
        } else if (direction === "prev") {
            date.setMonth(date.getMonth() - 1);
        }

        // Format back to YYYY-MM
        const newYear = date.getFullYear();
        const newMonth = String(date.getMonth() + 1).padStart(2, "0");
        feesMonthInput.value = `${newYear}-${newMonth}`;
    }

    // Attach listeners
    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.addEventListener("click", () => changeMonth("prev"));
        nextMonthBtn.addEventListener("click", () => changeMonth("next"));
    }
});
