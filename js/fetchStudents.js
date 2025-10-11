async function fetchStudents() {
    try {
        const res = await fetch("../php/get_students.php");
        if (!res.ok) throw new Error("Server error");
        return await res.json();
    } catch (err) {
        console.error("Fetch students error:", err);
        return [];
    }
}
