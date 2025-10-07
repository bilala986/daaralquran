const form = document.getElementById('signupForm');
const fullname = document.getElementById('fullname');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const errorBox = document.getElementById('errorBox');

form.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent default form submission

    // Clear previous messages
    errorBox.classList.add('d-none');
    errorBox.textContent = '';
    errorBox.classList.remove('alert-success', 'alert-danger');

    // Client-side validation
    if (!fullname.value.trim() || !email.value.trim() || !password.value.trim() || !confirmPassword.value.trim()) {
        errorBox.textContent = "Please fill in all the fields.";
        errorBox.classList.add('alert', 'alert-danger', 'd-block');
        return;
    }

    if (password.value !== confirmPassword.value) {
        errorBox.textContent = "Passwords do not match.";
        errorBox.classList.add('alert', 'alert-danger', 'd-block');
        confirmPassword.focus();
        return;
    }

    // Show "processing" message immediately
    errorBox.textContent = "Creating account, please wait...";
    errorBox.classList.add('alert', 'alert-info', 'd-block');

    // Prepare form data
    const formData = new FormData(form);

    // Send to PHP
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect immediately after signup
            window.location.href = "private/dashboard.php";
        } else {
            errorBox.textContent = data.message;
            errorBox.classList.remove('alert-info');
            errorBox.classList.add('alert-danger');
        }
    })
    .catch(err => {
        errorBox.textContent = "An error occurred. Please try again.";
        errorBox.classList.remove('alert-info');
        errorBox.classList.add('alert-danger');
    });
});
