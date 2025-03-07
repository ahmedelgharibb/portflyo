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
    
    // Get the stored password or use the default
    const storedPassword = localStorage.getItem('adminPassword') || 'admin123';

    if (passwordInput.value === storedPassword) {
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

// Helper function to generate a more reliable element selector path
function generateElementPath(element) {
    let path = '';
    let currentElement = element;
    
    // Build the path from the element up to the body
    while (currentElement !== document.body && currentElement.parentElement) {
        // Get the element tag
        let tag = currentElement.tagName.toLowerCase();
        
        // Get the element's section if available
        let section = '';
        if (currentElement.closest('section')) {
            let sectionEl = currentElement.closest('section');
            if (sectionEl.id) {
                section = `#${sectionEl.id}`;
            } else if (sectionEl.className) {
                let classNames = sectionEl.className.split(' ')
                    .filter(c => c.trim() !== '')
                    .map(c => `.${c}`)
                    .join('');
                section = classNames;
            }
        }
        
        // Add id if available
        if (currentElement.id) {
            path = `#${currentElement.id}` + path;
            break; // ID is unique, so we can stop here
        } 
        // Otherwise use tag name and position
        else {
            // Find position among siblings of same tag
            let index = 0;
            let sibling = currentElement;
            
            while (sibling) {
                if (sibling.tagName === currentElement.tagName) {
                    index++;
                }
                sibling = sibling.previousElementSibling;
            }
            
            // Add this element to the path
            path = `${tag}:nth-of-type(${index})${path ? ' > ' + path : ''}`;
            
            // If we have a section, add it to get more specificity
            if (section && currentElement.parentElement === document.body) {
                path = `${section} > ${path}`;
                break; // We've reached a section, which should be specific enough
            }
        }
        
        // Move to parent element for next iteration
        currentElement = currentElement.parentElement;
    }
    
    return path;
}

// Improved function to save all editable content
function saveAllContent() {
    console.log("Saving all editable content");
    
    // Clear previous saved content
    localStorage.removeItem('editableContent');
    
    // Save text content of all editable elements with better identification
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    let savedContent = {};
    
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
        
        // Create a unique and reliable identifier for this element
        let elementId = el.getAttribute('data-content-id');
        if (!elementId) {
            elementId = generateElementPath(el);
            el.setAttribute('data-content-id', elementId);
        }
        
        // Save content
        savedContent[elementId] = el.innerHTML;
        console.log(`Saving content for: ${elementId}`);
    });
    
    // Save teaching locations separately for more reliability
    const teachingSections = document.querySelectorAll('.teaching-section');
    let teachingData = {};
    
    teachingSections.forEach((section, sectionIndex) => {
        const sectionId = section.id || `teaching-section-${sectionIndex}`;
        const items = section.querySelectorAll('.teaching-item');
        
        let locations = [];
        items.forEach(item => {
            // Get only the text content (not including the "Remove" button)
            const textContent = item.childNodes[0].nodeValue || item.textContent.replace('Remove', '').trim();
            if (textContent) {
                locations.push(textContent);
            }
        });
        
        teachingData[sectionId] = locations;
    });
    
    // Save to localStorage
    localStorage.setItem('editableContent', JSON.stringify(savedContent));
    localStorage.setItem('teachingData', JSON.stringify(teachingData));
    
    console.log("Content saved successfully", savedContent);
    console.log("Teaching data saved", teachingData);
}

// Improved function to load all saved content
function loadAllSavedContent() {
    console.log("Loading all saved content");
    
    // Load saved text content
    const savedContent = JSON.parse(localStorage.getItem('editableContent') || '{}');
    
    // First pass: assign data-content-id attributes to elements for future reference
    document.querySelectorAll('h1, h2, p, span, .logo p').forEach(el => {
        // Skip protected elements
        if (
            el.textContent.trim() === "Developed by Portflyo" || 
            el.textContent.trim() === "Enter Admin Password" ||
            el.closest('footer') && el.tagName === 'P' && el.classList.contains('copyright') ||
            el.closest('.password-modal')
        ) {
            return;
        }
        
        if (!el.getAttribute('data-content-id')) {
            const elementId = generateElementPath(el);
            el.setAttribute('data-content-id', elementId);
        }
    });
    
    // Restore content using the saved selectors
    Object.keys(savedContent).forEach(selector => {
        try {
            const element = document.querySelector(`[data-content-id="${selector}"]`);
            if (element) {
                element.innerHTML = savedContent[selector];
                console.log(`Restored content for ${selector}`);
            } else {
                // Try direct query selector as fallback
                const directElement = document.querySelector(selector);
                if (directElement) {
                    directElement.innerHTML = savedContent[selector];
                    console.log(`Restored content using direct selector: ${selector}`);
                } else {
                    console.log(`Could not find element for ${selector}`);
                }
            }
        } catch (error) {
            console.error(`Error restoring content for ${selector}:`, error);
        }
    });
    
    // Load and restore teaching locations
    const teachingData = JSON.parse(localStorage.getItem('teachingData') || '{}');
    
    // Process each teaching section
    Object.keys(teachingData).forEach(sectionId => {
        let section;
        
        // Try to find the section by ID first
        if (sectionId.startsWith('teaching-section-')) {
            const index = parseInt(sectionId.split('-').pop());
            const allSections = document.querySelectorAll('.teaching-section');
            if (index < allSections.length) {
                section = allSections[index];
            }
        } else {
            section = document.getElementById(sectionId);
        }
        
        // If the section was found and it has locations to restore
        if (section && teachingData[sectionId].length > 0) {
            const grid = section.querySelector('.teaching-grid');
            if (grid) {
                // Clear existing items first
                grid.innerHTML = '';
                
                // Add saved locations
                teachingData[sectionId].forEach(locationText => {
                    const newLocation = document.createElement('div');
                    newLocation.classList.add('teaching-item');
                    newLocation.textContent = locationText;
                    grid.appendChild(newLocation);
                });
                
                console.log(`Restored ${teachingData[sectionId].length} teaching locations for section ${sectionId}`);
            }
        }
    });
}

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

function enableTeachingLocationsEdit() {
    const teachingSections = document.querySelectorAll('.teaching-section');
    teachingSections.forEach((section, sectionIndex) => {
        // Ensure section has an ID for reference
        if (!section.id) {
            section.id = `teaching-section-${sectionIndex}`;
        }
        
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
        
        // Add a unique content ID for saving/restoring if it doesn't have one
        if (!el.getAttribute('data-content-id')) {
            el.setAttribute('data-content-id', generateElementPath(el));
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

function saveChanges() {
    if (isEditMode) {
        // First save all content before removing edit mode
        saveAllContent();
        
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

// Initialize everything when the page loads
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
    
    // Load all saved text content and teaching locations
    loadAllSavedContent();
    
    // Debug log to check if theme selector elements exist
    const themeOptions = document.querySelectorAll('.theme-option');
    console.log("Number of theme options found:", themeOptions.length);
    themeOptions.forEach(option => {
        console.log("Theme option:", option.getAttribute('data-theme'));
    });
});
