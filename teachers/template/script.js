let isEditMode = false;

// Function to fetch content from GitHub
async function fetchContent() {
    try {
        const response = await fetch('/fetch-content');
        const content = await response.text();
        document.getElementById('content-container').innerHTML = content;
        console.log("Content fetched successfully from GitHub");
    } catch (error) {
        console.error('Error fetching content:', error);
    }
}

// Function to update content on GitHub
async function updateContent(content) {
    try {
        const response = await fetch('/update-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.error('Error updating content:', error);
    }
}

// Function to save all editable content
async function saveAllContent() {
    console.log("Saving all editable content");
    
    const content = document.getElementById('content-container').innerHTML;
    await updateContent(content);
    
    alert('Changes saved successfully!');
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
    const savedTheme = localStorage.getItem('theme') || 'default';
    console.log("Loading saved theme:", savedTheme);
    setTheme(savedTheme);
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
async function saveAllContent() {
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
    
    // Update content on GitHub
    const content = document.getElementById('content-container').innerHTML;
    await updateContent(content);
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

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded");
    fetchContent();
    initThemeSelector();
    loadSavedTheme();
    loadAllSavedContent();
});
