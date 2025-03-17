import config, { saveConfig } from './config.js';

class EditHandler {
    constructor() {
        this.isEditing = false;
        this.editableElements = new Map();
        this.setupEditButton();
    }

    setupEditButton() {
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Information';
        editBtn.onclick = () => this.handleEditClick();
        
        // Add button to the page
        document.querySelector('.hero-cta').appendChild(editBtn);
    }

    async handleEditClick() {
        if (!this.isEditing) {
            const password = prompt('Please enter the edit password:');
            if (password === config.security.editPassword) {
                this.startEditing();
            } else {
                alert('Incorrect password');
            }
        } else {
            await this.saveChanges();
        }
    }

    startEditing() {
        this.isEditing = true;
        document.querySelector('.edit-btn').innerHTML = '<i class="fas fa-save"></i> Save Changes';
        this.makeElementsEditable();
    }

    makeElementsEditable() {
        // Store original content and make elements editable
        this.setupEditableContent('.hero-title', 'branding.name');
        this.setupEditableContent('.about-name', 'personalInfo.name');
        this.setupEditableContent('.about-title', 'personalInfo.title');
        this.setupEditableContent('.about-bio', 'personalInfo.bio');
        this.setupEditableContent('.phone-value', 'personalInfo.contact.phone');
        this.setupEditableContent('.email-value', 'personalInfo.contact.email');
        this.setupEditableContent('.address-value', 'personalInfo.contact.address');

        // Make stats editable
        document.querySelectorAll('.stat-value').forEach((element, index) => {
            const statKeys = ['matchesPlayed', 'tournamentsWon', 'trainingSessions', 'yearsExperience'];
            this.setupEditableContent(`.stat-value-${index + 1}`, `stats.${statKeys[index]}`);
        });

        // Make physical info editable
        document.querySelectorAll('.info-value').forEach((element, index) => {
            const infoKeys = ['height', 'age', 'weight', 'position'];
            this.setupEditableContent(`.info-value-${index + 1}`, `physicalInfo.${infoKeys[index]}`);
        });

        // Make social media links editable
        this.setupEditableContent('.social-facebook', 'socialMedia.facebook', 'href');
        this.setupEditableContent('.social-instagram', 'socialMedia.instagram', 'href');
        this.setupEditableContent('.social-twitter', 'socialMedia.twitter', 'href');
    }

    setupEditableContent(selector, configPath, attribute = null) {
        const element = document.querySelector(selector);
        if (!element) return;

        const originalContent = attribute ? element.getAttribute(attribute) : element.textContent;
        this.editableElements.set(configPath, {
            element,
            originalContent,
            attribute
        });

        if (attribute) {
            element.style.position = 'relative';
            const overlay = document.createElement('div');
            overlay.className = 'editable-overlay';
            overlay.textContent = 'Click to edit ' + configPath;
            element.appendChild(overlay);
            element.onclick = (e) => {
                e.preventDefault();
                const newValue = prompt(`Edit ${configPath}:`, element.getAttribute(attribute));
                if (newValue) {
                    element.setAttribute(attribute, newValue);
                }
            };
        } else {
            element.contentEditable = true;
            element.classList.add('editable');
        }
    }

    async saveChanges() {
        const newConfig = { ...config };

        // Update config object with new values
        for (const [path, { element, attribute }] of this.editableElements) {
            const value = attribute ? element.getAttribute(attribute) : element.textContent;
            this.updateConfigValue(newConfig, path, value);
        }

        // Save to Supabase
        const saved = await saveConfig(newConfig);
        if (saved) {
            alert('Changes saved successfully!');
            this.exitEditMode();
        } else {
            alert('Error saving changes. Please try again.');
        }
    }

    updateConfigValue(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }

    exitEditMode() {
        this.isEditing = false;
        document.querySelector('.edit-btn').innerHTML = '<i class="fas fa-edit"></i> Edit Information';
        
        // Remove editable properties
        this.editableElements.forEach(({ element, attribute }) => {
            if (attribute) {
                const overlay = element.querySelector('.editable-overlay');
                if (overlay) overlay.remove();
                element.onclick = null;
            } else {
                element.contentEditable = false;
                element.classList.remove('editable');
            }
        });
        
        this.editableElements.clear();
    }
}

export default EditHandler; 