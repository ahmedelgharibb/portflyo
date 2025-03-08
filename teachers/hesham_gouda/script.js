// Initialize Firebase and IndexedDB
let isEditMode = false;
let db;
let firebaseDb;

// Firebase configuration - you'll need to replace these values with your own Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize IndexedDB
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
            
            // Add a sync status store
            if (!db.objectStoreNames.contains('syncStatus')) {
                db.createObjectStore('syncStatus');
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("IndexedDB initialized successfully");
            resolve(db);
        };
    });
}

// Initialize Firebase
function initFirebase() {
    return new Promise((resolve, reject) => {
        try {
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            
            // Get a reference to the database
            firebaseDb = firebase.database();
            console.log("Firebase initialized successfully");
            
            // Generate a unique device ID if not exists
            const deviceId = localStorage.getItem('device_id') || generateUniqueId();
            localStorage.setItem('device_id', deviceId);
            
            resolve(firebaseDb);
        } catch (error) {
            console.error("Firebase initialization error:", error);
            reject(error);
        }
    });
}

// Generate a unique ID for this device
function generateUniqueId() {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Enhanced write function that writes to both IndexedDB and Firebase
function writeToDb(storeName, key, value) {
    return new Promise(async (resolve, reject) => {
        try {
            // First, save to IndexedDB
            if (!db) {
                throw new Error("IndexedDB not initialized");
            }
            
            const transaction = db.transaction([storeName, 'syncStatus'], 'readwrite');
            const store = transaction.objectStore(storeName);
            const syncStore = transaction.objectStore('syncStatus');
            
            // Save the data to IndexedDB
            const request = store.put(value, key);
            
            request.onsuccess = async () => {
                console.log(`Data saved to IndexedDB ${storeName}/${key}`);
                
                // If Firebase is available, try to sync
                if (firebaseDb && navigator.onLine) {
                    try {
                        // Mark as syncing
                        await syncStore.put('syncing', `${storeName}_${key}`);
                        
                        // Process image data separately to optimize storage
                        let syncValue = value;
                        if (storeName === 'images') {
                            // Store a timestamp instead of the full image data
                            syncValue = { lastUpdated: Date.now() };
                        }
                        
                        // Create a path for Firebase based on store and key
                        const path = `portfolioData/${storeName}/${key.replace(/\./g, '_')}`;
                        
                        // Store data in Firebase with device ID and timestamp
                        await firebaseDb.ref(path).set({
                            data: syncValue,
                            updatedBy: localStorage.getItem('device_id'),
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        });
                        
                        // Mark as synced
                        await syncStore.put('synced', `${storeName}_${key}`);
                        console.log(`Data synced to Firebase ${path}`);
                    } catch (firebaseError) {
                        console.error(`Firebase sync error for ${storeName}/${key}:`, firebaseError);
                        // Mark as pending sync
                        await syncStore.put('pending', `${storeName}_${key}`);
                    }
                } else {
                    // Mark as pending sync if Firebase isn't available
                    await syncStore.put('pending', `${storeName}_${key}`);
                    console.log(`Data marked for sync later: ${storeName}/${key}`);
                }
                
                resolve();
            };
            
            request.onerror = (event) => {
                console.error(`Error saving to ${storeName}/${key}:`, event.target.error);
                reject(event.target.error);
            };
        } catch (error) {
            console.error(`Error in writeToDb for ${storeName}/${key}:`, error);
            reject(error);
        }
    });
}

// Enhanced read function that prioritizes IndexedDB but falls back to Firebase
function readFromDb(storeName, key) {
    return new Promise(async (resolve, reject) => {
        try {
            // First check IndexedDB
            if (!db) {
                throw new Error("IndexedDB not initialized");
            }
            
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = async () => {
                // If we have data in IndexedDB, use it
                if (request.result !== undefined) {
                    resolve(request.result);
                } 
                // If not, try to get it from Firebase if available
                else if (firebaseDb && navigator.onLine) {
                    try {
                        const path = `portfolioData/${storeName}/${key.replace(/\./g, '_')}`;
                        const snapshot = await firebaseDb.ref(path).once('value');
                        
                        if (snapshot.exists()) {
                            const data = snapshot.val().data;
                            
                            // Save this data to IndexedDB for next time
                            writeToDb(storeName, key, data)
                                .catch(err => console.error(`Error saving Firebase data to IndexedDB: ${storeName}/${key}`, err));
                            
                            resolve(data);
                        } else {
                            resolve(undefined);
                        }
                    } catch (firebaseError) {
                        console.error(`Error reading from Firebase for ${storeName}/${key}:`, firebaseError);
                        resolve(undefined);
                    }
                } else {
                    // Neither IndexedDB nor Firebase has the data
                    resolve(undefined);
                }
            };
            
            request.onerror = (event) => {
                console.error(`Error reading from ${storeName}/${key}:`, event.target.error);
                reject(event.target.error);
            };
        } catch (error) {
            console.error(`Error in readFromDb for ${storeName}/${key}:`, error);
            reject(error);
        }
    });
}

// Try to sync any pending changes when online
function syncPendingChanges() {
    return new Promise(async (resolve, reject) => {
        try {
            if (!db || !firebaseDb || !navigator.onLine) {
                console.log("Cannot sync - database or network unavailable");
                resolve(false);
                return;
            }
            
            const transaction = db.transaction(['syncStatus'], 'readonly');
            const syncStore = transaction.objectStore('syncStatus');
            const request = syncStore.openCursor();
            
            let pendingItems = [];
            
            request.onsuccess = async (event) => {
                const cursor = event.target.result;
                
                if (cursor) {
                    if (cursor.value === 'pending') {
                        // Extract storeName and key from the sync key
                        const [storeName, key] = cursor.key.split('_');
                        pendingItems.push({ storeName, key });
                    }
                    cursor.continue();
                } else {
                    // Now sync all pending items
                    console.log(`Found ${pendingItems.length} items to sync`);
                    
                    for (const item of pendingItems) {
                        try {
                            // Get the data from IndexedDB
                            const value = await new Promise((resolve, reject) => {
                                const tx = db.transaction([item.storeName], 'readonly');
                                const store = tx.objectStore(item.storeName);
                                const req = store.get(item.key);
                                
                                req.onsuccess = () => resolve(req.result);
                                req.onerror = (e) => reject(e.target.error);
                            });
                            
                            // Process image data separately to optimize storage
                            let syncValue = value;
                            if (item.storeName === 'images') {
                                // Store a timestamp instead of the full image data
                                syncValue = { lastUpdated: Date.now() };
                            }
                            
                            // Create a path for Firebase
                            const path = `portfolioData/${item.storeName}/${item.key.replace(/\./g, '_')}`;
                            
                            // Store in Firebase
                            await firebaseDb.ref(path).set({
                                data: syncValue,
                                updatedBy: localStorage.getItem('device_id'),
                                timestamp: firebase.database.ServerValue.TIMESTAMP
                            });
                            
                            // Mark as synced
                            const syncTx = db.transaction(['syncStatus'], 'readwrite');
                            const syncSt = syncTx.objectStore('syncStatus');
                            await syncSt.put('synced', `${item.storeName}_${item.key}`);
                            
                            console.log(`Synced pending item: ${item.storeName}/${item.key}`);
                        } catch (itemError) {
                            console.error(`Error syncing item ${item.storeName}/${item.key}:`, itemError);
                        }
                    }
                    
                    resolve(true);
                }
            };
            
            request.onerror = (event) => {
                console.error("Error reading sync status:", event.target.error);
                reject(event.target.error);
            };
        } catch (error) {
            console.error("Error in syncPendingChanges:", error);
            reject(error);
        }
    });
}

// Listen for changes from Firebase and update IndexedDB
function setupFirebaseListeners() {
    if (!firebaseDb) return;
    
    const deviceId = localStorage.getItem('device_id');
    
    // Listen for changes to all data types
    firebaseDb.ref('portfolioData').on('child_changed', async (snapshot) => {
        try {
            const storeName = snapshot.key;
            
            // Get all updated items in this store
            const storeSnapshot = await firebaseDb.ref(`portfolioData/${storeName}`).once('value');
            const storeData = storeSnapshot.val();
            
            if (storeData) {
                Object.keys(storeData).forEach(async (fbKey) => {
                    const key = fbKey.replace(/_/g, '.');
                    const item = storeData[fbKey];
                    
                    // Only process if it was updated by a different device
                    if (item.updatedBy !== deviceId) {
                        // For images, we need to handle specially
                        if (storeName === 'images' && item.data.lastUpdated) {
                            // Check if we need to fetch the actual image data
                            try {
                                const currentData = await readFromDb(storeName, key);
                                // If we have no data or old data, fetch the image
                                if (!currentData || !item.data.lastUpdated) {
                                    // In a real app, you would fetch the actual image from a storage service
                                    console.log(`Need to fetch image data for ${key}`);
                                }
                            } catch (imageError) {
                                console.error(`Error checking image sync status for ${key}:`, imageError);
                            }
                        } else {
                            // For normal data, just update IndexedDB
                            console.log(`Updating local data from Firebase: ${storeName}/${key}`);
                            
                            try {
                                // Update IndexedDB without triggering a sync back
                                const transaction = db.transaction([storeName, 'syncStatus'], 'readwrite');
                                const store = transaction.objectStore(storeName);
                                const syncStore = transaction.objectStore('syncStatus');
                                
                                await Promise.all([
                                    store.put(item.data, key),
                                    syncStore.put('synced', `${storeName}_${key}`)
                                ]);
                                
                                console.log(`Updated local data from Firebase: ${storeName}/${key}`);
                                
                                // If UI is already initialized, update it
                                if (document.readyState === 'complete') {
                                    // Refresh UI for this data type
                                    if (storeName === 'settings' && key === 'theme') {
                                        loadSavedTheme();
                                    } else if (storeName === 'content') {
                                        loadAllSavedContent();
                                    } else if (storeName === 'images' && key === 'profile-photo') {
                                        loadSavedImage('profile-photo');
                                    }
                                }
                            } catch (updateError) {
                                console.error(`Error updating IndexedDB from Firebase: ${storeName}/${key}`, updateError);
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Error processing Firebase update:", error);
        }
    });
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
        console.log("Theme option not found for:", themeName);
    }
}

// Function to apply saved theme on page load
function loadSavedTheme() {
    readFromDb('settings', 'theme')
        .then(savedTheme => {
            const themeToUse = savedTheme || 'default';
            console.log("Loading saved theme:", themeToUse);
            setTheme(themeToUse);
        })
        .catch(err => {
            console.error("Error loading theme:", err);
            setTheme('default');
        });
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

// Update this function to use the enhanced read function
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
    
    // Now try to load the saved image from synced storage
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
    
    // Save to synced storage
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
            
            // Update the password in synced storage
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
