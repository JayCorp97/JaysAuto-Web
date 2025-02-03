/////////Feedback
document.getElementById('aboutForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting if validation fails

    const name = document.getElementById('commentName').value;
    const msg = document.getElementById('commentMessage').value;
    const rate = document.querySelector('input[name="rating"]:checked'); // Get the selected rating

    let errorMessages = []; // Store error messages

    // Client-side validation
    // Validate Name (required, not empty)
    if (!name.trim()) {
        errorMessages.push('Name is required.');
    }

    // Validate that at least one of the Message or Rating is filled
    if (!msg.trim() && !rate) {
        errorMessages.push('Either a Comment or a Rating is required.');
    }

    // If there are errors, display them
    if (errorMessages.length > 0) {
        displayErrors(errorMessages);
    } else {
        // If there are no errors, allow the form to be submitted
        document.getElementById('errorMessages').style.display = 'none';
        // Show the success message section
        // document.getElementById('successMessage').style.display = 'block';
        alert(`Thank you.. ${name}, We have received your feeedback.`);
        
        // Optionally submit the form via AJAX or manually
        this.submit(); // This will trigger the form's default submission behavior (if necessary)
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
