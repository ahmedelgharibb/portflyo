import config, { saveConfig } from './config.js';

class EditHandler {
    constructor() {
        this.isEditing = false;
        this.editableElements = new Map();
        this.setupEditButton();
        this.setupPasswordModal();
        this.setupEditOverlay();
        this.setupSuccessNotification();
        this.addKeyboardShortcuts();
    }

    setupEditButton() {
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Portfolio';
        editBtn.onclick = () => this.handleEditClick();
        
        // Add button to the navigation actions container
        const navActions = document.querySelector('.navbar .nav-actions');
        if (navActions) {
            navActions.appendChild(editBtn);
        } else {
            document.body.appendChild(editBtn);
        }
    }

    setupPasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'password-modal';
        modal.innerHTML = `
            <h3>Enter Admin Password</h3>
            <input type="password" id="passwordInput" placeholder="Enter password">
            <div class="buttons">
                <button class="confirm-btn">Confirm</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;
        document.body.appendChild(modal);

        this.passwordModal = modal;
        const confirmBtn = modal.querySelector('.confirm-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const input = modal.querySelector('#passwordInput');

        confirmBtn.onclick = () => this.validatePassword(input.value);
        cancelBtn.onclick = () => this.closePasswordModal();
        input.onkeyup = (e) => {
            if (e.key === 'Enter') this.validatePassword(input.value);
            if (e.key === 'Escape') this.closePasswordModal();
        };
    }

    setupEditOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'edit-overlay';
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    setupSuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'edit-success';
        notification.textContent = 'Changes saved successfully! 🎉';
        document.body.appendChild(notification);
        this.notification = notification;
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + E to toggle edit mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.handleEditClick();
            }
            // Ctrl/Cmd + S to save while editing
            if ((e.ctrlKey || e.metaKey) && e.key === 's' && this.isEditing) {
                e.preventDefault();
                this.saveChanges();
            }
            // Escape to exit edit mode
            if (e.key === 'Escape' && this.isEditing) {
                this.exitEditMode();
            }
        });
    }

    async handleEditClick() {
        if (!this.isEditing) {
            this.showPasswordModal();
        } else {
            await this.saveChanges();
        }
    }

    showPasswordModal() {
        this.passwordModal.classList.add('show');
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';
        this.passwordModal.querySelector('#passwordInput').focus();
    }

    closePasswordModal() {
        this.passwordModal.classList.remove('show');
        this.overlay.style.opacity = '0';
        this.overlay.style.pointerEvents = 'none';
        this.passwordModal.querySelector('#passwordInput').value = '';
    }

    validatePassword(password) {
        if (password === config.security.editPassword) {
            this.closePasswordModal();
            this.startEditing();
        } else {
            this.showError('Incorrect password. Please try again.');
        }
    }

    showError(message) {
        const input = this.passwordModal.querySelector('#passwordInput');
        input.classList.add('error');
        input.value = '';
        input.placeholder = message;
        setTimeout(() => {
            input.classList.remove('error');
            input.placeholder = 'Enter password';
        }, 2000);
    }

    startEditing() {
        this.isEditing = true;
        document.body.classList.add('editing');
        const editBtn = document.querySelector('.edit-btn');
        editBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        this.makeElementsEditable();
    }

    makeElementsEditable() {
        // Store original content and make elements editable
        this.setupEditableContent('.hero-title', 'branding.name');
        this.setupEditableContent('#brandName', 'branding.name');
        this.setupEditableContent('.about-name', 'personalInfo.name');
        this.setupEditableContent('.about-title', 'personalInfo.title');
        this.setupEditableContent('.about-bio', 'personalInfo.bio');
        this.setupEditableContent('.phone-value', 'personalInfo.contact.phone');
        this.setupEditableContent('.email-value', 'personalInfo.contact.email');
        this.setupEditableContent('.address-value', 'personalInfo.contact.address');

        // Make stats editable
        const stats = ['matchesPlayed', 'tournamentsWon', 'trainingSessions', 'yearsExperience'];
        stats.forEach((stat, index) => {
            this.setupEditableContent(`.stat-value:nth-child(${index + 1})`, `stats.${stat}`);
        });

        // Make physical info editable
        const physicalInfo = ['height', 'age', 'weight', 'position'];
        physicalInfo.forEach((info, index) => {
            this.setupEditableContent(`.info-value:nth-child(${index + 1})`, `physicalInfo.${info}`);
        });

        // Make social media links editable
        this.setupEditableContent('.social-facebook', 'socialMedia.facebook', 'href');
        this.setupEditableContent('.social-instagram', 'socialMedia.instagram', 'href');
        this.setupEditableContent('.social-twitter', 'socialMedia.twitter', 'href');

        // Make achievements editable
        document.querySelectorAll('.achievement-card').forEach((card, index) => {
            this.setupEditableContent(`.achievement-card:nth-child(${index + 1}) .achievement-title`, `achievements.${index}.title`);
            this.setupEditableContent(`.achievement-card:nth-child(${index + 1}) .achievement-description`, `achievements.${index}.description`);
        });

        // Make timeline editable
        document.querySelectorAll('.timeline-item').forEach((item, index) => {
            this.setupEditableContent(`.timeline-item:nth-child(${index + 1}) .timeline-year`, `timeline.${index}.year`);
            this.setupEditableContent(`.timeline-item:nth-child(${index + 1}) h3`, `timeline.${index}.title`);
            this.setupEditableContent(`.timeline-item:nth-child(${index + 1}) p`, `timeline.${index}.description`);
        });
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
            const tooltip = document.createElement('div');
            tooltip.className = 'edit-tooltip';
            tooltip.textContent = `Edit ${configPath}`;
            element.appendChild(tooltip);

            element.onclick = (e) => {
                e.preventDefault();
                const newValue = prompt(`Edit ${configPath}:`, element.getAttribute(attribute));
                if (newValue !== null) {
                    element.setAttribute(attribute, newValue);
                }
            };
        } else {
            element.contentEditable = true;
            element.classList.add('editable');
            element.dataset.configPath = configPath;
        }
    }

    async saveChanges() {
        const editBtn = document.querySelector('.edit-btn');
        editBtn.classList.add('saving');

        const newConfig = { ...config };

        // Update config object with new values
        for (const [path, { element, attribute }] of this.editableElements) {
            const value = attribute ? element.getAttribute(attribute) : element.textContent;
            this.updateConfigValue(newConfig, path, value);
        }

        try {
            // Save to Supabase
            const saved = await saveConfig(newConfig);
            if (saved) {
                this.showSuccessNotification();
                this.exitEditMode();
            } else {
                throw new Error('Failed to save changes');
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Error saving changes. Please try again.');
        } finally {
            editBtn.classList.remove('saving');
        }
    }

    showSuccessNotification() {
        this.notification.classList.add('show');
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
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
        document.body.classList.remove('editing');
        const editBtn = document.querySelector('.edit-btn');
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Portfolio';

        // Remove editable properties
        this.editableElements.forEach(({ element, attribute }) => {
            if (attribute) {
                const tooltip = element.querySelector('.edit-tooltip');
                if (tooltip) tooltip.remove();
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