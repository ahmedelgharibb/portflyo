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
    
    // Debug log to check if theme selector elements exist
    const themeOptions = document.querySelectorAll('.theme-option');
    console.log("Number of theme options found:", themeOptions.length);
    themeOptions.forEach(option => {
        console.log("Theme option:", option.getAttribute('data-theme'));
    });
});
