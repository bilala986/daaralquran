document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const addButton = document.getElementById("addButton");
    const addForm = document.getElementById("addStudentForm");
    const editForm = document.getElementById("editStudentForm");
    const studentsTbody = document.getElementById("studentsTbody");
    const searchInput = document.getElementById("searchInput");
    const refreshBtn = document.getElementById("refreshBtn");
    const filterClass = document.getElementById("filterClass");
    const filterBtn = document.getElementById("filterBtn");

    const editCourseDropdown = document.getElementById("edit_course_completed");
    const editCourseOther = document.getElementById("edit_course_completed_other");
    const addCourseDropdown = document.getElementById("add_course_completed");
    const addCourseOther = document.getElementById("add_course_completed_other");

    const confirmDeleteBtn = document.getElementById("confirmDeleteStudentBtn");
    const deleteMessageEl = document.getElementById("deleteStudentMessage");

    const addStudentModalEl = document.getElementById("addStudentModal");
    const editStudentModalEl = document.getElementById("editStudentModal");
    const deleteStudentModalEl = document.getElementById("deleteStudentModal");

    const addStudentModal = new bootstrap.Modal(addStudentModalEl);
    const editStudentModal = new bootstrap.Modal(editStudentModalEl);
    const deleteStudentModal = new bootstrap.Modal(deleteStudentModalEl);

    let allStudents = [];
    let studentToDeleteId = null;

    function isMobile() {
        return window.innerWidth < 768; // Bootstrap md breakpoint
    }

    // Toast helper
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

    // Escape HTML
    function escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Render students using Method 4 (document fragment)
    function renderStudents(list) {
        studentsTbody.innerHTML = ""; // clear old rows
        if (!list || !list.length) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 8;
            td.className = "text-muted py-3";
            td.textContent = "No students found.";
            tr.appendChild(td);
            studentsTbody.appendChild(tr);
            return;
        }

        const frag = document.createDocumentFragment();

        list.forEach(student => {
            const tr = document.createElement("tr");
            tr.dataset.id = student.id;

            // Email
            const tdEmail = document.createElement("td");
            tdEmail.className = "d-none d-md-table-cell";
            tdEmail.textContent = escapeHtml(student.email);
            tr.appendChild(tdEmail);

            // Full name clickable on mobile
            const tdName = document.createElement("td");
            const spanName = document.createElement("span");
            spanName.className = "fw-bold text-primary student-info-trigger";
            spanName.style.cursor = "pointer";
            spanName.dataset.id = student.id;
            spanName.textContent = escapeHtml(student.full_name);
            tdName.appendChild(spanName);
            tr.appendChild(tdName);

            // Phone number
            const tdPhone = document.createElement("td");
            tdPhone.className = "d-none d-md-table-cell";
            tdPhone.textContent = escapeHtml(student.phone_number);
            tr.appendChild(tdPhone);

            // Emergency contact name
            const tdEmergencyName = document.createElement("td");
            tdEmergencyName.className = "d-none d-md-table-cell";
            tdEmergencyName.textContent = escapeHtml(student.emergency_contact_name || "-");
            tr.appendChild(tdEmergencyName);

            // Emergency contact number
            const tdEmergencyNumber = document.createElement("td");
            tdEmergencyNumber.className = "d-none d-md-table-cell";
            tdEmergencyNumber.textContent = escapeHtml(student.emergency_contact_number || "-");
            tr.appendChild(tdEmergencyNumber);

            // Course
            const tdCourse = document.createElement("td");
            tdCourse.textContent = escapeHtml(student.course_completed || "-");
            tr.appendChild(tdCourse);

            // Class
            const tdClass = document.createElement("td");
            tdClass.textContent = escapeHtml(student.class_name || "-");
            tr.appendChild(tdClass);

            // Actions
            const tdActions = document.createElement("td");
            tdActions.className = "d-flex justify-content-center flex-nowrap";

            const editBtn = document.createElement("button");
            editBtn.className = "btn btn-primary btn-sm me-1 btn-edit-student";
            editBtn.dataset.id = student.id;
            editBtn.innerHTML = `<i class="bi bi-pencil-square"></i>`;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-sm btn-outline-danger btn-delete-student";
            deleteBtn.dataset.id = student.id;
            deleteBtn.innerHTML = `<i class="bi bi-trash"></i>`;

            tdActions.appendChild(editBtn);
            tdActions.appendChild(deleteBtn);
            tr.appendChild(tdActions);

            frag.appendChild(tr);
        });

        studentsTbody.appendChild(frag);
    }

    // Load students from server
    async function fetchStudents() {
        try {
            const res = await fetch("../php/get_students.php");
            return await res.json();
        } catch (err) {
            console.error(err);
            showToast("Failed to fetch students", "danger");
            return [];
        }
    }

    async function loadStudents() {
        studentsTbody.innerHTML = `<tr><td colspan="8" class="text-muted py-3">Loading...</td></tr>`;
        const students = await fetchStudents();
        allStudents = students;

        const q = searchInput.value.trim().toLowerCase();
        const courseVal = document.getElementById("filterCourse")?.value || "";
        const classVal = document.getElementById("filterClassModal")?.value || "";

        const filtered = students.filter(s => {
            const haystack = [
                s.full_name,
                s.email,
                s.phone_number,
                s.emergency_contact_name,
                s.emergency_contact_number
            ].join(" ").toLowerCase();

            const matchesSearch = !q || haystack.includes(q);
            const matchesCourse = !courseVal || s.course_completed === courseVal;
            const matchesClass = !classVal || s.class_name === classVal;
            return matchesSearch && matchesCourse && matchesClass;
        });

        renderStudents(filtered);
    }






    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            // clear search
            if (searchInput) searchInput.value = "";

            // clear modal filters
            const filterCourse = document.getElementById("filterCourse");
            const filterClassModal = document.getElementById("filterClassModal");
            if (filterCourse) filterCourse.value = "";
            if (filterClassModal) filterClassModal.value = "";

            // reload full list
            loadStudents();
        });
    }


    // Filter / search actions
    if (filterBtn) filterBtn.addEventListener("click", loadStudents);
    if (filterClass) filterClass.addEventListener("change", loadStudents);

    // Add course "Other" toggle
    if (addCourseDropdown) {
        addCourseDropdown.addEventListener("change", () => {
            const isOther = addCourseDropdown.value === "Other";
            addCourseOther.style.display = isOther ? "block" : "none";
            if (!isOther) addCourseOther.value = "";
            if (isOther) addCourseOther.focus();
        });
    }

    // Edit course "Other" toggle
    if (editCourseDropdown) {
        editCourseDropdown.addEventListener("change", () => {
            const isOther = editCourseDropdown.value === "Other";
            editCourseOther.style.display = isOther ? "block" : "none";
            if (!isOther) editCourseOther.value = "";
            if (isOther) editCourseOther.focus();
        });
    }

    // Submit add form
    if (addForm) {
        addForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (addCourseDropdown.value === "Other") {
                const customCourse = addCourseOther.value.trim();
                if (!customCourse) {
                    showToast("Please enter a course name when selecting 'Other'.", "danger");
                    addCourseOther.focus();
                    return;
                }
            }

            const formData = new FormData(addForm);
            if (addCourseDropdown.value === "Other") {
                formData.set("course_completed", addCourseOther.value.trim());
            }

            try {
                const res = await fetch("../php/add_student.php", { method: "POST", body: formData });
                const result = await res.json();
                if (result.status === "success") {
                    showToast("Student added successfully", "success");
                    addForm.reset();
                    addCourseOther.style.display = "none";
                    addStudentModal.hide();
                    await loadStudents();
                } else {
                    showToast(result.message || "Error adding student", "danger");
                }
            } catch (err) {
                console.error(err);
                showToast("Network error while adding student", "danger");
            }
        });
    }

    // Click handlers for edit/delete buttons (delegated)
    document.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".btn-edit-student");
        if (editBtn) {
            const id = editBtn.dataset.id;
            const student = allStudents.find(s => s.id == id);
            if (!student) {
                showToast("Student not found", "danger");
                return;
            }

            // populate edit form
            document.getElementById("edit_student_id").value = student.id;
            document.getElementById("edit_email").value = student.email;
            document.getElementById("edit_full_name").value = student.full_name;
            document.getElementById("edit_phone_number").value = student.phone_number;
            document.getElementById("edit_emergency_contact_name").value = student.emergency_contact_name || "";
            document.getElementById("edit_emergency_contact_number").value = student.emergency_contact_number || "";
            document.getElementById("edit_class_name").value = student.class_name || "";

            const knownCourses = ["Tafseer of Juz 30", "Seerah Course", "40 Hadeeth of Imam Nawwawi", "None"];
            if (knownCourses.includes(student.course_completed)) {
                editCourseDropdown.value = student.course_completed;
                editCourseOther.style.display = "none";
                editCourseOther.value = "";
            } else {
                editCourseDropdown.value = "Other";
                editCourseOther.style.display = "block";
                editCourseOther.value = student.course_completed || "";
            }

            editStudentModal.show();
            return;
        }

        const deleteBtn = e.target.closest(".btn-delete-student");
        if (deleteBtn) {
            studentToDeleteId = deleteBtn.dataset.id;
            const student = allStudents.find(s => s.id == studentToDeleteId);
            const name = student ? student.full_name : "this student";
            deleteMessageEl.textContent = `Are you sure you want to delete "${name}"? This will also remove their attendance and fees records.`;
            deleteStudentModal.show();
            return;
        }
    });





    // ✅ Show modal when clicking the full name
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest(".student-info-trigger");
        if (!trigger) return;

        const studentId = trigger.dataset.id;
        const student = allStudents.find(s => s.id == studentId);
        if (!student) return;

        // Fill modal content
        document.getElementById("studentInfoTitle").textContent = student.full_name;

        document.getElementById("studentInfoBody").innerHTML = `
            <p><strong>Email:</strong> ${escapeHtml(student.email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(student.phone_number)}</p>
            <p><strong>Emergency Contact Name:</strong> ${escapeHtml(student.emergency_contact_name || "-")}</p>
            <p><strong>Emergency Contact Number:</strong> ${escapeHtml(student.emergency_contact_number || "-")}</p>
            <p><strong>Course Completed:</strong> ${escapeHtml(student.course_completed || "-")}</p>
            <p><strong>Class:</strong> ${escapeHtml(student.class_name || "-")}</p>
        `;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById("studentInfoModal"));
        modal.show();
    });






    // Handle edit submit
    if (editForm) {
        editForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(editForm);

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
                    showToast("Student updated", "success");
                    editStudentModal.hide();
                    await loadStudents();
                } else {
                    showToast(result.message || "Error updating student", "danger");
                }
            } catch (err) {
                console.error(err);
                showToast("Network error while updating student", "danger");
            }
        });
    }

    // Confirm delete
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
                    showToast("Student deleted", "success");
                    deleteStudentModal.hide();
                    studentToDeleteId = null;
                    await loadStudents();
                } else {
                    showToast(result.message || "Error deleting student", "danger");
                }
            } catch (err) {
                console.error(err);
                showToast("Network error while deleting student", "danger");
            }
        });
    }
    
    
    
    
    
    
    // Open modal when filter button is clicked
    document.getElementById("filterBtn").addEventListener("click", () => {
        const modal = new bootstrap.Modal(document.getElementById("filterModal"));
        modal.show();
    });

    // Apply filters
    document.getElementById("applyFilters").addEventListener("click", () => {
        loadStudents();
        const modalEl = document.getElementById("filterModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
    });

    // ✅ Clear all filters and reload
    document.getElementById("clearFilters").addEventListener("click", () => {
        document.getElementById("filterCourse").value = "";
        document.getElementById("filterClassModal").value = "";
        loadStudents();
    });


    
    // ✅ Live search while typing
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const q = searchInput.value.trim().toLowerCase();

            const filtered = allStudents.filter(s => {
                const haystack = `
                    ${s.full_name}
                    ${s.email}
                    ${s.phone_number}
                    ${s.emergency_contact_name}
                    ${s.emergency_contact_number}
                `.toLowerCase();
                return haystack.includes(q);
            });

            renderStudents(filtered);
        });
    }

    
    
    

    // initial load
    loadStudents();
});
