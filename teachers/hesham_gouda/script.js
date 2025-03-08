let isEditMode = false;
let db;

// Initialize the database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('portfolioData', 1);
        
        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores for different types of data
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings');
            }
            
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images');
            }
            
            if (!db.objectStoreNames.contains('content')) {
                db.createObjectStore('content');
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("IndexedDB initialized successfully");
            resolve(db);
        };
    });
}

// Write data to IndexedDB
function writeToDb(storeName, key, value) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Database not initialized"));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(value, key);
        
        request.onsuccess = () => {
            console.log(`Data saved to ${storeName}/${key}`);
            resolve();
        };
        
        request.onerror = (event) => {
            console.error(`Error saving to ${storeName}/${key}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

// Read data from IndexedDB
function readFromDb(storeName, key) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error("Database not initialized"));
            return;
        }
        
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            console.error(`Error reading from ${storeName}/${key}:`, event.target.error);
            reject(event.target.error);
        };
    });
}

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
    writeToDb('settings', 'theme', themeName)
        .catch(err => console.error("Failed to save theme:", err));
    
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
    readFromDb('settings', 'theme')
        .then(savedTheme => {
            const themeToUse = savedTheme || 'default';
            console.log("Loading saved theme:", themeToUse); // Debug log
            setTheme(themeToUse);
        })
        .catch(err => {
            console.error("Error loading theme:", err);
            setTheme('default');
        });
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
    readFromDb('settings', 'adminPassword')
        .then(storedPassword => {
            const password = storedPassword || 'admin123';
            
            if (passwordInput.value === password) {
                hidePasswordOverlay();
                enableEditMode();
            } else {
                passwordError.textContent = 'Incorrect password. Please try again.';
            }
        })
        .catch(err => {
            console.error("Error checking password:", err);
            // Fallback to default password if database error
            if (passwordInput.value === 'admin123') {
                hidePasswordOverlay();
                enableEditMode();
            } else {
                passwordError.textContent = 'Incorrect password. Please try again.';
            }
        });
}

// Add an image upload handler
function handleImageUpload(event, imageElementId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(imageElementId).src = e.target.result;
            
            // Save image to IndexedDB
            writeToDb('images', imageElementId, e.target.result)
                .then(() => console.log(`Image "${imageElementId}" updated successfully`))
                .catch(err => console.error(`Failed to save image "${imageElementId}":`, err));
        };
        reader.readAsDataURL(file);
    }
}

// Update this function to use IndexedDB
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
    
    // Now try to load the saved image from IndexedDB
    if (imageElement) {
        readFromDb('images', imageElementId)
            .then(savedImage => {
                if (savedImage) {
                    imageElement.src = savedImage;
                    console.log(`Loaded saved image for "${imageElementId}"`);
                } else {
                    console.log(`No saved image found for "${imageElementId}"`);
                }
            })
            .catch(err => {
                console.error(`Error loading image for "${imageElementId}":`, err);
            });
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
    
    // Save to IndexedDB
    writeToDb('content', 'editableContent', savedContent)
        .then(() => console.log("Content saved successfully", savedContent))
        .catch(err => console.error("Failed to save content:", err));
    
    writeToDb('content', 'teachingData', teachingData)
        .then(() => console.log("Teaching data saved", teachingData))
        .catch(err => console.error("Failed to save teaching data:", err));
}

// Improved function to load all saved content
function loadAllSavedContent() {
    console.log("Loading all saved content");
    
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
    
    // Load and restore saved content
    readFromDb('content', 'editableContent')
        .then(savedContent => {
            if (!savedContent) {
                console.log("No saved content found");
                return;
            }
            
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
        })
        .catch(err => console.error("Error loading content:", err));
    
    // Load and restore teaching locations
    readFromDb('content', 'teachingData')
        .then(teachingData => {
            if (!teachingData) {
                console.log("No saved teaching data found");
                return;
            }
            
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
        })
        .catch(err => console.error("Error loading teaching data:", err));
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
    readFromDb('settings', 'adminPassword')
        .then(storedPassword => {
            const password = storedPassword || 'admin123';
            
            // Validate inputs
            if (currentPassword !== password) {
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
            
            // Update the password in IndexedDB
            writeToDb('settings', 'adminPassword', newPassword)
                .then(() => {
                    // Show success message and close modal
                    alert('Password updated successfully!');
                    hideChangePasswordModal();
                })
                .catch(err => {
                    console.error("Failed to update password:", err);
                    errorEl.textContent = 'Failed to update password. Please try again.';
                });
        })
        .catch(err => {
            console.error("Error checking current password:", err);
            errorEl.textContent = 'An error occurred. Please try again.';
        });
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
// Add these functions to your script.js file

// Configuration for cloud storage
const CLOUD_STORAGE_URL = 'YOUR_API_ENDPOINT'; // Replace with your actual API endpoint
let syncEnabled = false;

// Function to initialize cloud sync
function initCloudSync() {
    // Check if cloud sync is enabled in settings
    readFromDb('settings', 'cloudSyncEnabled')
        .then(enabled => {
            syncEnabled = enabled === true;
            if (syncEnabled) {
                console.log("Cloud sync is enabled");
                // Perform initial sync on startup
                syncFromCloud();
            }
        })
        .catch(err => {
            console.error("Error checking cloud sync setting:", err);
        });
}

// Function to enable/disable cloud sync
function toggleCloudSync(enabled) {
    syncEnabled = enabled;
    writeToDb('settings', 'cloudSyncEnabled', enabled)
        .then(() => {
            console.log("Cloud sync setting updated:", enabled);
            if (enabled) {
                // If enabling, do an immediate sync to cloud
                syncToCloud();
            }
        })
        .catch(err => {
            console.error("Failed to update cloud sync setting:", err);
        });
}

// Function to sync local data to cloud
function syncToCloud() {
    if (!syncEnabled) return;
    
    console.log("Syncing data to cloud...");
    
    // 1. Collect all data to sync
    Promise.all([
        readFromDb('settings', 'theme'),
        readFromDb('settings', 'adminPassword'),
        readFromDb('images', 'profile-photo'),
        readFromDb('content', 'editableContent'),
        readFromDb('content', 'teachingData')
    ])
    .then(([theme, adminPassword, profilePhoto, editableContent, teachingData]) => {
        // Create payload with all data
        const payload = {
            lastUpdated: new Date().toISOString(),
            data: {
                settings: {
                    theme: theme,
                    adminPassword: adminPassword
                },
                images: {
                    'profile-photo': profilePhoto
                },
                content: {
                    editableContent: editableContent,
                    teachingData: teachingData
                }
            }
        };
        
        // 2. Send data to cloud storage
        fetch(CLOUD_STORAGE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Cloud sync failed: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Cloud sync successful:", data);
            // Save the sync timestamp
            writeToDb('settings', 'lastSyncTime', new Date().toISOString());
        })
        .catch(err => {
            console.error("Cloud sync error:", err);
        });
    })
    .catch(err => {
        console.error("Error collecting data for cloud sync:", err);
    });
}

// Function to sync from cloud to local
function syncFromCloud() {
    if (!syncEnabled) return;
    
    console.log("Syncing data from cloud...");
    
    // Get the last sync timestamp
    readFromDb('settings', 'lastSyncTime')
        .then(lastSyncTime => {
            // Add timestamp to URL if available
            let url = CLOUD_STORAGE_URL;
            if (lastSyncTime) {
                url += `?since=${encodeURIComponent(lastSyncTime)}`;
            }
            
            // Fetch the latest data from cloud
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Cloud fetch failed: ${response.status}`);
                    }
                    return response.json();
                })
                .then(cloudData => {
                    // Only update if cloud data is newer
                    if (!lastSyncTime || new Date(cloudData.lastUpdated) > new Date(lastSyncTime)) {
                        console.log("Newer data found in cloud, updating local data");
                        
                        // Update settings
                        if (cloudData.data.settings) {
                            if (cloudData.data.settings.theme) {
                                writeToDb('settings', 'theme', cloudData.data.settings.theme)
                                    .then(() => setTheme(cloudData.data.settings.theme))
                                    .catch(err => console.error("Error updating theme:", err));
                            }
                            
                            if (cloudData.data.settings.adminPassword) {
                                writeToDb('settings', 'adminPassword', cloudData.data.settings.adminPassword)
                                    .catch(err => console.error("Error updating admin password:", err));
                            }
                        }
                        
                        // Update images
                        if (cloudData.data.images && cloudData.data.images['profile-photo']) {
                            writeToDb('images', 'profile-photo', cloudData.data.images['profile-photo'])
                                .then(() => {
                                    // Update the image if it's on the page
                                    const profileImg = document.getElementById('profile-photo');
                                    if (profileImg) {
                                        profileImg.src = cloudData.data.images['profile-photo'];
                                    }
                                })
                                .catch(err => console.error("Error updating profile photo:", err));
                        }
                        
                        // Update content
                        if (cloudData.data.content) {
                            if (cloudData.data.content.editableContent) {
                                writeToDb('content', 'editableContent', cloudData.data.content.editableContent)
                                    .then(() => {
                                        // Update the page content
                                        const content = cloudData.data.content.editableContent;
                                        Object.keys(content).forEach(selector => {
                                            try {
                                                const element = document.querySelector(`[data-content-id="${selector}"]`);
                                                if (element) {
                                                    element.innerHTML = content[selector];
                                                } else {
                                                    // Try direct selector as fallback
                                                    const directElement = document.querySelector(selector);
                                                    if (directElement) {
                                                        directElement.innerHTML = content[selector];
                                                    }
                                                }
                                            } catch (error) {
                                                console.error(`Error updating content for ${selector}:`, error);
                                            }
                                        });
                                    })
                                    .catch(err => console.error("Error updating editable content:", err));
                            }
                            
                            if (cloudData.data.content.teachingData) {
                                writeToDb('content', 'teachingData', cloudData.data.content.teachingData)
                                    .then(() => {
                                        // Update teaching sections
                                        const teachingData = cloudData.data.content.teachingData;
                                        Object.keys(teachingData).forEach(sectionId => {
                                            let section = document.getElementById(sectionId);
                                            
                                            // Fall back to index-based lookup if needed
                                            if (!section && sectionId.startsWith('teaching-section-')) {
                                                const index = parseInt(sectionId.split('-').pop());
                                                const allSections = document.querySelectorAll('.teaching-section');
                                                if (index < allSections.length) {
                                                    section = allSections[index];
                                                }
                                            }
                                            
                                            if (section) {
                                                const grid = section.querySelector('.teaching-grid');
                                                if (grid) {
                                                    // Only update if in normal mode (not edit mode)
                                                    if (!isEditMode) {
                                                        // Clear existing items
                                                        grid.innerHTML = '';
                                                        
                                                        // Add locations
                                                        teachingData[sectionId].forEach(locationText => {
                                                            const newLocation = document.createElement('div');
                                                            newLocation.classList.add('teaching-item');
                                                            newLocation.textContent = locationText;
                                                            grid.appendChild(newLocation);
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                    })
                                    .catch(err => console.error("Error updating teaching data:", err));
                            }
                        }
                        
                        // Update last sync time
                        writeToDb('settings', 'lastSyncTime', cloudData.lastUpdated);
                    } else {
                        console.log("Local data is up-to-date");
                    }
                })
                .catch(err => {
                    console.error("Error syncing from cloud:", err);
                });
        })
        .catch(err => {
            console.error("Error getting last sync time:", err);
        });
}

// Modify the saveChanges() function to trigger cloud sync
function saveChanges() {
    if (isEditMode) {
        // First save all content before removing edit mode
        saveAllContent();
        
        // Trigger sync to cloud if enabled
        if (syncEnabled) {
            syncToCloud();
        }
        
        // [... rest of the original function ...]
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

// Add a cloud sync toggle to the admin UI
function addCloudSyncToggle() {
    if (isEditMode && !document.getElementById('cloud-sync-toggle')) {
        // Create the toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.id = 'cloud-sync-container';
        toggleContainer.className = 'cloud-sync-container';
        
        // Create the toggle switch
        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'switch';
        
        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.id = 'cloud-sync-toggle';
        
        // Check current setting
        readFromDb('settings', 'cloudSyncEnabled')
            .then(enabled => {
                toggleInput.checked = enabled === true;
            })
            .catch(() => {
                toggleInput.checked = false;
            });
        
        toggleInput.addEventListener('change', function() {
            toggleCloudSync(this.checked);
            if (this.checked) {
                // If enabling, sync immediately
                syncToCloud();
            }
        });
        
        const toggleSlider = document.createElement('span');
        toggleSlider.className = 'slider';
        
        toggleLabel.appendChild(toggleInput);
        toggleLabel.appendChild(toggleSlider);
        
        // Create the label text
        const toggleText = document.createElement('span');
        toggleText.textContent = 'Enable Cross-Browser Sync';
        toggleText.className = 'sync-label';
        
        // Assemble the container
        toggleContainer.appendChild(toggleLabel);
        toggleContainer.appendChild(toggleText);
        
        // Add an info icon with explanation
        const infoIcon = document.createElement('span');
        infoIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
        infoIcon.className = 'sync-info';
        infoIcon.title = 'Enable this to sync your changes across different browsers and devices. Requires server configuration.';
        
        toggleContainer.appendChild(infoIcon);
        
        // Add the container to the page
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.parentNode.insertBefore(toggleContainer, changePasswordBtn.nextSibling);
        } else {
            const themeToggleBtn = document.getElementById('toggle-theme-btn');
            if (themeToggleBtn) {
                themeToggleBtn.parentNode.insertBefore(toggleContainer, themeToggleBtn.nextSibling);
            }
        }
    }
}

// Add to the enableEditMode function
function enableEditMode() {
    // [... existing code ...]
    isEditMode = true;
    
    // Add edit-mode class to body for CSS hooks
    document.body.classList.add('edit-mode');
    
    // Show the theme selector panel at the top of the page
    const themeSelectorPanel = document.getElementById('theme-selector-panel');
    themeSelectorPanel.style.display = 'block';
    
    // Show save changes button
    document.getElementById('save-changes-btn').style.display = 'block';

    // [... rest of the existing function ...]
    
    // Add cloud sync toggle
    addCloudSyncToggle();
    
    // Enable teaching locations edit
    enableTeachingLocationsEdit();
}

// Add to the document ready function
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded"); // Debug log
    
    // Initialize the database first
    initDB()
        .then(() => {
            console.log("Database initialized, loading data");
            
            // Initialize cloud sync
            initCloudSync();
            
            // Add a periodic sync check (every 5 minutes)
            setInterval(syncFromCloud, 5 * 60 * 1000);
            
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
        })
        .catch(err => {
            console.error("Failed to initialize database:", err);
            alert("There was an error initializing the database. Some features may not work correctly.");
        });
});

// Add some CSS for the cloud sync toggle
document.head.insertAdjacentHTML('beforeend', `
<style>
.cloud-sync-container {
    display: flex;
    align-items: center;
    margin: 10px 0;
    padding: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
}

.sync-label {
    margin-left: 10px;
    font-weight: bold;
}

.sync-info {
    margin-left: 8px;
    color: #666;
    cursor: help;
}

/* Toggle switch styles */
.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: #2196F3;
}

input:checked + .slider:before {
    transform: translateX(26px);
}
</style>
`);
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
    
    // Initialize the database first
    initDB()
        .then(() => {
            console.log("Database initialized, loading data");
            
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
        })
        .catch(err => {
            console.error("Failed to initialize database:", err);
            alert("There was an error initializing the database. Some features may not work correctly.");
        });
});
