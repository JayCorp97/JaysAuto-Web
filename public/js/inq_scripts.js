document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting if validation fails

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const msg = document.getElementById('msg').value;

    let errorMessages = []; // Store error messages

    //Client-side validation
    // Validate Name (required, not empty)
    if (!name.trim()) {
        errorMessages.push('Name is required.');
    }

    // Validate Email (must be a valid email)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.match(emailRegex)) {
        errorMessages.push('Please enter a valid email address.');
    }

    // Validate Phone (must be a 10-digit number)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone.match(phoneRegex)) {
        errorMessages.push('Please enter a valid 10-digit phone number.');
    }

    // Validate Message (required, not empty)
    if (!msg.trim()) {
        errorMessages.push('Message is required.');
    }

    // If there are errors, display them
    if (errorMessages.length > 0) {
        displayErrors(errorMessages);
    } else {
        // If there are no errors, allow the form to be submitted
        document.getElementById('errorMessages').style.display = 'none';
        alert(`Thank you.. ${name}, We have received your message.`);
        this.submit(); // This will trigger the form's default submission behavior
    }
});

// Function to display error messages
function displayErrors(errors) {
    const errorList = document.getElementById('errorList');
    errorList.innerHTML = ''; // Clear previous error messages

    // Add new error messages
    errors.forEach(function (error) {
        const listItem = document.createElement('li');
        listItem.textContent = error;
        errorList.appendChild(listItem);
    });

    // Show the error messages section
    document.getElementById('errorMessages').style.display = 'block';
}

