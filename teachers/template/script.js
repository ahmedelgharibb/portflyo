const BACKEND_URL = 'https://portflyo-hp9y.vercel.app'; // Replace with your Vercel backend URL

let isEditMode = false;

// Function to fetch content from GitHub via backend
async function fetchContent() {
    try {
        const response = await fetch(`${BACKEND_URL}/fetch-content`);
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${await response.text()}`);
        }
        const content = await response.text();
        document.getElementById('content-container').innerHTML = content;
        console.log("Content fetched successfully from GitHub");
        
        // Initialize everything after content is loaded
        initThemeSelector();
        loadSavedTheme();
        loadAllSavedContent();
        setupProfileImageHandling();
    } catch (error) {
        console.error('Error fetching content:', error);
        document.getElementById('content-container').innerHTML = 
            `<div class="error-message">Failed to load content: ${error.message}</div>`;
    }
}

// Function to update content on GitHub via backend
async function updateContent(content) {
    try {
        const response = await fetch(`${BACKEND_URL}/update-content`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${await response.text()}`);
        }
        
        const result = await response.text();
        console.log(result);
        return true;
    } catch (error) {
        console.error('Error updating content:', error);
        alert(`Failed to save changes: ${error.message}`);
        return false;
    }
}

// Function to save all editable content
async function saveAllContent() {
    console.log("Saving all editable content");
    
    // Save local content first
    saveLocalContent();
    
    // Then update GitHub
    const content = document.getElementById('content-container').innerHTML;
    const success = await updateContent(content);
    
    if (success) {
        alert('Changes saved successfully!');
    }
}

// Function to save content to localStorage only
function saveLocalContent() {
    // Clear previous saved content
    localStorage.removeItem('editableContent');
    
    // Save text content of all editable elements with better identification
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    let savedContent = {};
    
    editableElements.forEach(el => {
        // Skip protected elements
        if (
            el.classList.contains('protected-content') ||
            el.closest('.password-modal') ||
            (el.closest('footer') && el.classList.contains('copyright'))
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
            const textContent = item.querySelector('button') 
                ? item.textContent.replace('Remove', '').trim()
                : item.textContent.trim();
                
            if (textContent) {
                locations.push(textContent);
            }
        });
        
        teachingData[sectionId] = locations;
    });
    
    // Save to localStorage
    localStorage.setItem('editableContent', JSON.stringify(savedContent));
    localStorage.setItem('teachingData', JSON.stringify(teachingData));
    
    console.log("Content saved successfully to localStorage", savedContent);
    console.log("Teaching data saved to localStorage", teachingData);
}

// Function to set up profile image handling
function setupProfileImageHandling() {
    // Add ID to profile image if not present
    const profileImage = document.querySelector('.about-image img');
    if (profileImage && !profileImage.id) {
        profileImage.id = 'profile-photo';
        profileImage.classList.add('editable-image');
    }
    
    // Load saved profile image
    loadSavedImage('profile-photo');
    
    // Add click handler for image upload in edit mode
    if (profileImage) {
        profileImage.addEventListener('click', function() {
            if (isEditMode) {
                // Create file input if it doesn't exist
                let fileInput = document.getElementById('image-upload-input');
                if (!fileInput) {
                    fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.id = 'image-upload-input';
                    fileInput.accept = 'image/*';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                    
                    fileInput.addEventListener('change', function(event) {
                        handleImageUpload(event, 'profile-photo');
                    });
                }
                fileInput.click();
            }
        });
    }
}

// Add an image upload handler
function handleImageUpload(event, imageElementId) {
    const file = event.target.files[0];
    if (file) {
        // Validate file size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size must be less than 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageElement = document.getElementById(imageElementId);
            if (imageElement) {
                imageElement.src = e.target.result;
                
                // Save image to localStorage
                try {
                    localStorage.setItem(imageElementId, e.target.result);
                    console.log(`Image "${imageElementId}" updated successfully`);
                } catch (error) {
                    console.error('Error saving image to localStorage:', error);
                    alert('Failed to save image: The image may be too large for local storage');
                }
            }
        };
        reader.readAsDataURL(file);
    }
}

// Load saved image from localStorage
function loadSavedImage(imageElementId) {
    // Find the image element - either by ID or by selector if ID not set yet
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
        try {
            const savedImage = localStorage.getItem(imageElementId);
            if (savedImage) {
                imageElement.src = savedImage;
                console.log(`Loaded saved image for "${imageElementId}"`);
            } else {
                console.log(`No saved image found for "${imageElementId}"`);
            }
        } catch (error) {
            console.error(`Error loading image for "${imageElementId}":`, error);
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

// Improved function to load all saved content
function loadAllSavedContent() {
    console.log("Loading all saved content");
    
    try {
        // Load saved text content
        const savedContent = JSON.parse(localStorage.getItem('editableContent') || '{}');
        
        // First pass: assign data-content-id attributes to elements for future reference
        document.querySelectorAll('[contenteditable="true"], h1, h2, h3, p, span, div.logo p').forEach(el => {
            // Skip protected elements
            if (
                el.classList.contains('protected-content') ||
                el.closest('.password-modal') ||
                (el.closest('footer') && el.classList.contains('copyright'))
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
        loadTeachingLocations();
    } catch (error) {
        console.error('Error loading saved content:', error);
    }
}

// Separate function to load teaching locations
function loadTeachingLocations() {
    try {
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
                        addTeachingLocation(grid, locationText, isEditMode);
                    });
                    
                    console.log(`Restored ${teachingData[sectionId].length} teaching locations for section ${sectionId}`);
                }
            }
        });
    } catch (error) {
        console.error('Error loading teaching locations:', error);
    }
}

// Helper function to add a teaching location with proper formatting
function addTeachingLocation(container, text, withRemoveButton = false) {
    const newLocation = document.createElement('div');
    newLocation.classList.add('teaching-item');
    newLocation.textContent = text;
    
    // Add remove button if in edit mode
    if (withRemoveButton) {
        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-btn');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', function() {
            newLocation.remove();
        });
        newLocation.appendChild(removeBtn);
    }
    
    container.appendChild(newLocation);
    return newLocation;
}

// Function to toggle theme
function setTheme(themeName) {
    console.log("Setting theme to:", themeName);
    
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
        console.log("Theme option not found for:", themeName);
    }
}

// Function to apply saved theme on page load
function loadSavedTheme() {
    try {
        const savedTheme = localStorage.getItem('theme') || 'default';
        console.log("Loading saved theme:", savedTheme);
        setTheme(savedTheme);
    } catch (error) {
        console.error('Error loading saved theme:', error);
    }
}

// Initialize theme selector
function initThemeSelector() {
    console.log("Initializing theme selector");
    document.querySelectorAll('.theme-option').forEach(option => {
        const theme = option.getAttribute('data-theme');
        console.log("Found theme option:", theme);
        
        option.addEventListener('click', function() {
            console.log("Theme clicked:", theme);
            setTheme(theme);
        });
    });
}

// Password overlay functions
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

// Function to enable edit mode
function enableEditMode() {
    console.log("Enabling edit mode");
    isEditMode = true;
    
    // Make all editable elements contenteditable
    document.querySelectorAll('[data-content-id]').forEach(el => {
        // Skip protected content
        if (
            el.classList.contains('protected-content') ||
            el.closest('.password-modal') ||
            (el.closest('footer') && el.classList.contains('copyright'))
        ) {
            return;
        }
        
        el.setAttribute('contenteditable', 'true');
    });
    
    // Add editable attribute to headings and paragraphs that might not have it
    document.querySelectorAll('h1, h2, h3, p, span, div.logo p').forEach(el => {
        // Skip protected content
        if (
            el.classList.contains('protected-content') ||
            el.closest('.password-modal') ||
            (el.closest('footer') && el.classList.contains('copyright'))
        ) {
            return;
        }
        
        el.setAttribute('contenteditable', 'true');
        if (!el.getAttribute('data-content-id')) {
            const elementId = generateElementPath(el);
            el.setAttribute('data-content-id', elementId);
        }
    });
    
    // Show the save changes button
    document.getElementById('save-changes-btn').style.display = 'block';
    
    // Show the theme selector panel
    document.getElementById('theme-selector-panel').style.display = 'block';
    
    // Enable image upload functionality for profile photo
    const profilePhoto = document.getElementById('profile-photo');
    if (profilePhoto) {
        profilePhoto.classList.add('editable-image');
        profilePhoto.title = 'Click to change profile image';
    }
    
    // Add "Add Location" buttons to teaching sections
    document.querySelectorAll('.teaching-section').forEach(section => {
        // Add heading if not exists
        if (!section.querySelector('h3')) {
            const heading = document.createElement('h3');
            heading.textContent = 'Locations';
            heading.setAttribute('contenteditable', 'true');
            section.prepend(heading);
        }
        
        const grid = section.querySelector('.teaching-grid');
        if (grid) {
            // Add "Add Location" button
            if (!section.querySelector('.add-location-btn')) {
                const addBtn = document.createElement('button');
                addBtn.classList.add('add-location-btn');
                addBtn.textContent = 'Add Location';
                addBtn.addEventListener('click', function() {
                    const newLocation = addTeachingLocation(grid, 'New Location', true);
                    // Make the text editable
                    newLocation.setAttribute('contenteditable', 'true');
                });
                section.appendChild(addBtn);
            }
            
            // Add remove buttons to existing locations
            grid.querySelectorAll('.teaching-item').forEach(item => {
                if (!item.querySelector('.remove-btn')) {
                    const removeBtn = document.createElement('button');
                    removeBtn.classList.add('remove-btn');
                    removeBtn.textContent = 'Remove';
                    removeBtn.addEventListener('click', function() {
                        item.remove();
                    });
                    item.appendChild(removeBtn);
                }
                
                // Make the text editable
                item.setAttribute('contenteditable', 'true');
            });
        }
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded");
    fetchContent();
    
    // Update copyright year
    const copyrightYear = document.getElementById('copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().getFullYear();
    }
});
