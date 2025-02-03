
/////services

document.getElementById('appoinmentForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting if validation fails

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const service = document.getElementById('service').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    let errorMessages = []; // Store error messages

    //Client-side validation
    // Validate Name (required, not empty)
    if (!name.trim()) {
        errorMessages.push('Name is required.');
    }

    // Validate Phone (must be a 10-digit number)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone.match(phoneRegex)) {
        errorMessages.push('Please enter a valid 10-digit phone number.');
    }

    // Validate service (required, not empty)
    if (!service.trim()) {
        errorMessages.push('Service is required.');
    }

    // Validate Date (required, not empty)
    if (!date.trim()) {
        errorMessages.push('Date is required.');
    }

    // Validate Time (required, not empty)
    if (!time.trim()) {
        errorMessages.push('Time is required.');
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


