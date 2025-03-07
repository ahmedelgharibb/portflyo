let isEditMode = false;

// Function to toggle theme
function setTheme(themeName) {
    console.log("Setting theme to:", themeName); // Debug log
    
    // Remove all theme classes first
    document.body.classList.remove('theme-blue', 'theme-purple', 'theme-dark');
    
    // Add the selected theme class if not default
    if (themeName !== 'default') {
        document.body.classList.add('theme-' + themeName);
    }
    
    // Save the theme preference
    localStorage.setItem('theme', themeName);
    
    // Update active state in theme selector
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Find and add active class to the selected theme option
    const selectedOption = document.querySelector(`.theme-option[data-theme="${themeName}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    } else {
        console.log("Theme option not found for:", themeName); // Debug log
    }
}

// Function to apply saved theme on page load
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    console.log("Loading saved theme:", savedTheme); // Debug log
    setTheme(savedTheme);
}

// Initialize theme selector
function initThemeSelector() {
    console.log("Initializing theme selector"); // Debug log
    document.querySelectorAll('.theme-option').forEach(option => {
        const theme = option.getAttribute('data-theme');
        console.log("Found theme option:", theme); // Debug log
        
        option.addEventListener('click', function() {
            console.log("Theme clicked:", theme); // Debug log
            setTheme(theme);
        });
    });
}

function showPasswordOverlay() {
    document.getElementById('password-overlay').style.display = 'flex';
}

function hidePasswordOverlay() {
    document.getElementById('password-overlay').style.display = 'none';
    // Clear the password field and error message
    document.getElementById('admin-password').value = '';
    document.getElementById('password-error').textContent = '';
}

function toggleThemeSelector() {
    const themeSelectorPanel = document.getElementById('theme-selector-panel');
    const currentDisplay = themeSelectorPanel.style.display;
    themeSelectorPanel.style.display = currentDisplay === 'none' || currentDisplay === '' ? 'block' : 'none';
}

function checkPassword() {
    const passwordInput = document.getElementById('admin-password');
    const passwordError = document.getElementById('password-error');

    if (passwordInput.value === 'admin123') {
        hidePasswordOverlay();
        enableEditMode();
    } else {
        passwordError.textContent = 'Incorrect password. Please try again.';
    }
}

// Add an image upload handler
function handleImageUpload(event, imageElementId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(imageElementId).src = e.target.result;
            
            // Save image to localStorage (this is a simple implementation - limited by localStorage size)
            localStorage.setItem(imageElementId, e.target.result);
            
            console.log(`Image "${imageElementId}" updated successfully`);
        };
        reader.readAsDataURL(file);
    }
}

// Update this function in script.js
function loadSavedImage(imageElementId) {
    // First, find the image element - either by ID or by selector if ID not set yet
    let imageElement = document.getElementById(imageElementId);
    
    // If element not found by ID (likely on first load), try to find it by class/selector
    if (!imageElement && imageElementId === 'profile-photo') {
        imageElement = document.querySelector('.about-image img');
        // Give it the ID so it can be found later
        if (imageElement) {
            imageElement.id = imageElementId;
        }
    }
    
    // Now try to load the saved image from localStorage
    if (imageElement) {
        const savedImage = localStorage.getItem(imageElementId);
        if (savedImage) {
            imageElement.src = savedImage;
            console.log(`Loaded saved image for "${imageElementId}"`);
        } else {
            console.log(`No saved image found for "${imageElementId}"`);
        }
    } else {
        console.log(`Could not find element with ID "${imageElementId}"`);
    }
}

// Update the DOMContentLoaded event at the bottom of script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded"); // Debug log
    
    // Make sure theme options are properly initialized
    initThemeSelector();
    
    // Load saved theme (if any)
    loadSavedTheme();
    
    // First, ensure the profile image has an ID
    const profileImage = document.querySelector('.about-image img');
    if (profileImage && !profileImage.id) {
        profileImage.id = 'profile-photo';
    }
    
    // Then load the saved image
    loadSavedImage('profile-photo');
    
    // Debug log to check if theme selector elements exist
    const themeOptions = document.querySelectorAll('.theme-option');
    console.log("Number of theme options found:", themeOptions.length);
    themeOptions.forEach(option => {
        console.log("Theme option:", option.getAttribute('data-theme'));
    });
});

function enableEditMode() {
    isEditMode = true;
    
    // Add edit-mode class to body for CSS hooks
    document.body.classList.add('edit-mode');
    
    // Show the theme selector panel at the top of the page
    const themeSelectorPanel = document.getElementById('theme-selector-panel');
    themeSelectorPanel.style.display = 'block';
    
    // Show save changes button
    document.getElementById('save-changes-btn').style.display = 'block';

    // Add a button to toggle the theme selector if it doesn't exist
    if (!document.getElementById('toggle-theme-btn')) {
        const themeToggleBtn = document.createElement('button');
        themeToggleBtn.id = 'toggle-theme-btn';
        themeToggleBtn.className = 'toggle-theme-btn';
        themeToggleBtn.innerHTML = 'Change Theme <i class="fas fa-palette"></i>';
        themeToggleBtn.onclick = toggleThemeSelector;
        
        // Insert the button at the top of the page, right after the header
        const header = document.querySelector('header');
        header.parentNode.insertBefore(themeToggleBtn, header.nextSibling);
    }

    // Make all text elements editable
    const editableElements = document.querySelectorAll('h1, h2, p, span, .logo p');
    editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.classList.add('edit-mode-input');
    });

    // Enable photo uploads - make profile image clickable for upload
    const profileImage = document.querySelector('.about-image img');
    if (profileImage && !document.getElementById('profile-photo-upload')) {
        // Add an ID to the image if it doesn't have one
        if (!profileImage.id) {
            profileImage.id = 'profile-photo';
        }
        
        // Create upload container and visual indicators
        const uploadContainer = document.createElement('div');
        uploadContainer.className = 'photo-upload-container';
        
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'profile-photo-upload';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => handleImageUpload(e, profileImage.id));
        
        // Create upload button that will trigger the file input
        const uploadButton = document.createElement('button');
        uploadButton.className = 'photo-upload-btn';
        uploadButton.innerHTML = '<i class="fas fa-camera"></i> Change Photo';
        uploadButton.onclick = () => fileInput.click();
        
        // Add these elements to the container
        uploadContainer.appendChild(fileInput);
        uploadContainer.appendChild(uploadButton);
        
        // Add container after the image
        profileImage.parentNode.appendChild(uploadContainer);
        
        // Add edit indication to the image
        profileImage.classList.add('editable-image');
    }

    // Enable editing for teaching locations
    enableTeachingLocationsEdit();
}

function enableTeachingLocationsEdit() {
    const teachingSections = document.querySelectorAll('.teaching-section');
    teachingSections.forEach(section => {
        const grid = section.querySelector('.teaching-grid');
        
        // Add remove button to existing locations
        const locations = grid.querySelectorAll('.teaching-item');
        locations.forEach(location => {
            // Only add remove button if it doesn't already exist
            if (!location.querySelector('.remove-location')) {
                location.setAttribute('contenteditable', 'true');
                location.classList.add('edit-mode-input');
                
                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove';
                removeBtn.classList.add('remove-location');
                removeBtn.onclick = function(e) {
                    e.stopPropagation();
                    location.remove();
                };
                location.appendChild(removeBtn);
            }
        });

        // Add "Add New Location" button if it doesn't already exist
        if (!section.querySelector('.add-new-location')) {
            const addButton = document.createElement('button');
            addButton.textContent = 'Add New Location';
            addButton.classList.add('add-new-location');
            addButton.onclick = function() {
                const newLocation = document.createElement('div');
                newLocation.classList.add('teaching-item', 'edit-mode-input');
                newLocation.setAttribute('contenteditable', 'true');
                newLocation.textContent = 'New Location';
                
                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove';
                removeBtn.classList.remove('remove-location');
                removeBtn.classList.add('remove-location');
                removeBtn.onclick = function(e) {
                    e.stopPropagation();
                    newLocation.remove();
                };
                
                newLocation.appendChild(removeBtn);
                grid.appendChild(newLocation);
            };
            
            section.appendChild(addButton);
        }
    });
}
// Add this function to script.js
function showChangePasswordModal() {
    // Create the change password modal if it doesn't exist
    if (!document.getElementById('change-password-modal')) {
        const modal = document.createElement('div');
        modal.id = 'change-password-modal';
        modal.className = 'edit-overlay';
        modal.innerHTML = `
            <div class="password-modal">
                <h2>Change Admin Password</h2>
                <input type="password" id="current-password" placeholder="Current password">
                <input type="password" id="new-password" placeholder="New password">
                <input type="password" id="confirm-password" placeholder="Confirm new password">
                <div class="btn-container">
                    <button class="btn back-btn" onclick="hideChangePasswordModal()">Cancel</button>
                    <button class="btn" onclick="updatePassword()">Update Password</button>
                </div>
                <p id="password-change-error" style="color: red;"></p>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Show the modal
    document.getElementById('change-password-modal').style.display = 'flex';
}

function hideChangePasswordModal() {
    document.getElementById('change-password-modal').style.display = 'none';
    // Clear the password fields and error message
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-change-error').textContent = '';
}

function updatePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('password-change-error');
    
    // Get the stored password or use the default
    const storedPassword = localStorage.getItem('adminPassword') || 'admin123';
    
    // Validate inputs
    if (currentPassword !== storedPassword) {
        errorEl.textContent = 'Current password is incorrect.';
        return;
    }
    
    if (newPassword === '') {
        errorEl.textContent = 'New password cannot be empty.';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorEl.textContent = 'New passwords do not match.';
        return;
    }
    
    // Update the password in localStorage
    localStorage.setItem('adminPassword', newPassword);
    
    // Show success message and close modal
    alert('Password updated successfully!');
    hideChangePasswordModal();
}

// Modify the checkPassword function to use the stored password
function checkPassword() {
    const passwordInput = document.getElementById('admin-password');
    const passwordError = document.getElementById('password-error');
    
    // Get the stored password or use the default
    const storedPassword = localStorage.getItem('adminPassword') || 'admin123';

    if (passwordInput.value === storedPassword) {
        hidePasswordOverlay();
        enableEditMode();
    } else {
        passwordError.textContent = 'Incorrect password. Please try again.';
    }
}

// Modify enableEditMode function to add a change password button
function enableEditMode() {
    isEditMode = true;
    
    // Add edit-mode class to body for CSS hooks
    document.body.classList.add('edit-mode');
    
    // Show the theme selector panel at the top of the page
    const themeSelectorPanel = document.getElementById('theme-selector-panel');
    themeSelectorPanel.style.display = 'block';
    
    // Show save changes button
    document.getElementById('save-changes-btn').style.display = 'block';

    // Add a button to toggle the theme selector if it doesn't exist
    if (!document.getElementById('toggle-theme-btn')) {
        const themeToggleBtn = document.createElement('button');
        themeToggleBtn.id = 'toggle-theme-btn';
        themeToggleBtn.className = 'toggle-theme-btn';
        themeToggleBtn.innerHTML = 'Change Theme <i class="fas fa-palette"></i>';
        themeToggleBtn.onclick = toggleThemeSelector;
        
        // Insert the button at the top of the page, right after the header
        const header = document.querySelector('header');
        header.parentNode.insertBefore(themeToggleBtn, header.nextSibling);
    }
    
    // Add change password button if it doesn't exist
    if (!document.getElementById('change-password-btn')) {
        const changePasswordBtn = document.createElement('button');
        changePasswordBtn.id = 'change-password-btn';
        changePasswordBtn.className = 'change-password-btn';
        changePasswordBtn.innerHTML = 'Change Password <i class="fas fa-key"></i>';
        changePasswordBtn.onclick = showChangePasswordModal;
        
        // Insert the button near the theme button
        const themeBtn = document.getElementById('toggle-theme-btn');
        themeBtn.parentNode.insertBefore(changePasswordBtn, themeBtn.nextSibling);
        
    }

    // Make only specific text elements editable (exclude protected elements)
    const editableElements = document.querySelectorAll('h1, h2, p, span, .logo p');
    editableElements.forEach(el => {
        // Skip protected elements
        if (
            el.textContent.trim() === "Developed by Portflyo" || 
            el.textContent.trim() === "Enter Admin Password" ||
            el.closest('footer') && el.tagName === 'P' && el.classList.contains('copyright') ||
            el.closest('.password-modal')
        ) {
            return;
        }
        
        el.setAttribute('contenteditable', 'true');
        el.classList.add('edit-mode-input');
    });

    // Enable photo uploads - make profile image clickable for upload
    const profileImage = document.querySelector('.about-image img');
    if (profileImage && !document.getElementById('profile-photo-upload')) {
        // Add an ID to the image if it doesn't have one
        if (!profileImage.id) {
            profileImage.id = 'profile-photo';
        }
        
        // Create upload container and visual indicators
        const uploadContainer = document.createElement('div');
        uploadContainer.className = 'photo-upload-container';
        
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'profile-photo-upload';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => handleImageUpload(e, profileImage.id));
        
        // Create upload button that will trigger the file input
        const uploadButton = document.createElement('button');
        uploadButton.className = 'photo-upload-btn';
        uploadButton.innerHTML = '<i class="fas fa-camera"></i> Change Photo';
        uploadButton.onclick = () => fileInput.click();
        
        // Add these elements to the container
        uploadContainer.appendChild(fileInput);
        uploadContainer.appendChild(uploadButton);
        
        // Add container after the image
        profileImage.parentNode.appendChild(uploadContainer);
        
        // Add edit indication to the image
        profileImage.classList.add('editable-image');
    }

    // Enable editing for teaching locations
    enableTeachingLocationsEdit();
}

// Modify the saveChanges function to hide the change password button
function saveChanges() {
    if (isEditMode) {
        // Remove edit-mode class from body
        document.body.classList.remove('edit-mode');
        
        // Remove edit-related elements and styling
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(el => {
            el.setAttribute('contenteditable', 'false');
            el.classList.remove('edit-mode-input');
        });

        // Remove remove buttons and add new location buttons
        document.querySelectorAll('.remove-location').forEach(btn => btn.remove());
        document.querySelectorAll('.add-new-location').forEach(btn => btn.remove());

        // Remove photo upload buttons but keep the uploaded images
        document.querySelectorAll('.photo-upload-container').forEach(container => container.remove());
        document.querySelectorAll('.editable-image').forEach(img => img.classList.remove('editable-image'));

        // Hide theme selector
        document.getElementById('theme-selector-panel').style.display = 'none';
        
        // Remove the theme toggle button
        const themeToggleBtn = document.getElementById('toggle-theme-btn');
        if (themeToggleBtn) {
            themeToggleBtn.remove();
        }
        
        // Remove the change password button
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.remove();
        }

        // Hide save changes button
        document.getElementById('save-changes-btn').style.display = 'none';
        isEditMode = false;

        alert('Changes saved successfully!');
    }
}
function saveChanges() {
    if (isEditMode) {
        // Remove edit-mode class from body
        document.body.classList.remove('edit-mode');
        
        // Remove edit-related elements and styling
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(el => {
            el.setAttribute('contenteditable', 'false');
            el.classList.remove('edit-mode-input');
        });

        // Remove remove buttons and add new location buttons
        document.querySelectorAll('.remove-location').forEach(btn => btn.remove());
        document.querySelectorAll('.add-new-location').forEach(btn => btn.remove());

        // Remove photo upload buttons but keep the uploaded images
        document.querySelectorAll('.photo-upload-container').forEach(container => container.remove());
        document.querySelectorAll('.editable-image').forEach(img => img.classList.remove('editable-image'));

        // Hide theme selector
        document.getElementById('theme-selector-panel').style.display = 'none';
        
        // Remove the theme toggle button
        const themeToggleBtn = document.getElementById('toggle-theme-btn');
        if (themeToggleBtn) {
            themeToggleBtn.remove();
        }

        // Hide save changes button
        document.getElementById('save-changes-btn').style.display = 'none';
        isEditMode = false;

        alert('Changes saved successfully!');
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded"); // Debug log
    
    // Make sure theme options are properly initialized
    initThemeSelector();
    
    // Load saved theme (if any)
    loadSavedTheme();
    
    // Load saved profile image if available
    loadSavedImage('profile-photo');
    
    // Debug log to check if theme selector elements exist
    const themeOptions = document.querySelectorAll('.theme-option');
    console.log("Number of theme options found:", themeOptions.length);
    themeOptions.forEach(option => {
        console.log("Theme option:", option.getAttribute('data-theme'));
    });
});
