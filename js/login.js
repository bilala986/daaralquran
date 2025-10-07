const form = document.getElementById('loginForm');
const email = document.getElementById('email');
const password = document.getElementById('password');
const errorBox = document.getElementById('errorBox');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Hide previous error
    errorBox.classList.add('d-none');
    errorBox.textContent = '';

    // Client-side validation
    if (!email.value.trim() || !password.value.trim()) {
        errorBox.textContent = "Please enter both email and password.";
        errorBox.classList.remove('d-none');
        return;
    }

    // Prepare form data
    const formData = new FormData(form);

    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to dashboard
            window.location.href = "private/dashboard.php";
        } else {
            // Show error
            errorBox.textContent = data.message;
            errorBox.classList.remove('d-none');
        }
    })
    .catch(error => {
        errorBox.textContent = "An error occurred. Please try again.";
        errorBox.classList.remove('d-none');
    });
});
