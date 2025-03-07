document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('teacher-form');
    const teacherNameInput = document.getElementById('teacher-name');
    const subjectInput = document.getElementById('subject');
    const statusMessage = document.getElementById('status');
    const websiteLink = document.getElementById('website-link');
    const resultContainer = document.getElementById('result-container');
    
    // Hide result container initially
    resultContainer.style.display = 'none';

    /**
     * Handles form submission and sends data to the backend
     * @param {Event} event - The form submission event
     */
    async function createTeacherWebsite(event) {
        event.preventDefault();

        const teacherName = teacherNameInput.value.trim();
        const subject = subjectInput.value.trim();
        
        if (!teacherName || !subject) {
            showStatus("Please fill in all fields.", "error");
            return;
        }

        // Generate a slug from teacher name
        const teacherSlug = teacherName.replace(/\s+/g, "_").toLowerCase();
        
        showStatus("Creating teacher website...", "loading");
        resultContainer.style.display = 'none';

        try {
            // Send data to backend API
            const response = await fetch('/api/create-teacher-website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: teacherName,
                    subject: subject,
                    slug: teacherSlug
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create website");
            }
            
            const data = await response.json();
            
            // Show success message and website link
            showStatus(`Website for ${teacherName} created successfully!`, "success");
            websiteLink.href = data.websiteUrl;
            websiteLink.textContent = `View ${teacherName}'s Website`;
            resultContainer.style.display = 'block';
            
            // Reset form
            form.reset();
            
        } catch (error) {
            console.error("Error:", error);
            showStatus(`Error: ${error.message}`, "error");
        }
    }

    /**
     * Helper function to display status messages
     * @param {string} message - The message to display
     * @param {string} type - The type of message (success, error, loading)
     */
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = "";
        statusMessage.classList.add(type);
    }

    form.addEventListener("submit", createTeacherWebsite);
});
