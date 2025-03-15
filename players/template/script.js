// script.js

// Preloader
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    preloader.classList.add('fade-out');
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 600);
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Hero Section Typing Effect
const heroText = document.querySelector('.hero h1');
const text = "Welcome to SportsPro";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        heroText.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
    }
}

typeWriter();

// Stats Counter Animation
const statCards = document.querySelectorAll('.stat-card');
const statsSection = document.querySelector('.stats-section');

const options = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            statCards.forEach(card => {
                const value = card.querySelector('.stat-value');
                const target = parseInt(value.textContent);
                let count = 0;
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16);

                const updateCount = () => {
                    if (count < target) {
                        count += increment;
                        value.textContent = Math.ceil(count);
                        requestAnimationFrame(updateCount);
                    } else {
                        value.textContent = target;
                    }
                };

                updateCount();
            });
            observer.unobserve(statsSection);
        }
    });
}, options);

observer.observe(statsSection);

// Gallery Hover Effect
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.querySelector('.gallery-overlay').style.opacity = '1';
    });

    item.addEventListener('mouseleave', () => {
        item.querySelector('.gallery-overlay').style.opacity = '0';
    });
});

// Testimonial Slider
const testimonialItems = document.querySelectorAll('.testimonial-item');
let currentTestimonial = 0;

function showTestimonial(index) {
    testimonialItems.forEach((item, i) => {
        item.style.display = i === index ? 'block' : 'none';
    });
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonialItems.length;
    showTestimonial(currentTestimonial);
}

setInterval(nextTestimonial, 5000); // Change testimonial every 5 seconds

// Contact Form Submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Simulate form submission
    setTimeout(() => {
        alert(`Thank you, ${name}! Your message has been sent.`);
        contactForm.reset();
    }, 1000);
});

// Scroll Reveal Animations
const scrollReveal = ScrollReveal({
    origin: 'bottom',
    distance: '60px',
    duration: 1000,
    delay: 200,
    reset: true
});

scrollReveal.reveal('.hero-content, .about-grid, .stats-grid, .gallery-grid, .timeline, .testimonial-slider, .contact-grid', {
    interval: 200
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrollPosition = window.scrollY;
    hero.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
});

// Dynamic Year in Footer
const year = new Date().getFullYear();
document.querySelector('.footer-bottom').innerHTML = `&copy; ${year} SportsPro. All rights reserved.`;

// Edit Mode Functionality
const editModeBtn = document.getElementById('editModeBtn');
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const submitPassword = document.getElementById('submitPassword');
const cancelPassword = document.getElementById('cancelPassword');

let isEditMode = false;
const editableElements = [
    ...document.querySelectorAll('.info-value'),
    ...document.querySelectorAll('.stat-value'),
    ...document.querySelectorAll('.about-content p'),
    document.querySelector('.about-content h3'),
];

// Add editable class to elements
editableElements.forEach(el => {
    el.classList.add('editable');
});

// Show password modal
editModeBtn.addEventListener('click', () => {
    passwordModal.classList.add('active');
});

// Hide password modal
cancelPassword.addEventListener('click', () => {
    passwordModal.classList.remove('active');
    passwordInput.value = '';
});

// Handle password submission
submitPassword.addEventListener('click', async () => {
    const password = passwordInput.value;
    
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (data.success) {
            enableEditMode();
            passwordModal.classList.remove('active');
            passwordInput.value = '';
        } else {
            alert('Invalid password');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
});

function enableEditMode() {
    isEditMode = true;
    editModeBtn.textContent = 'Save Changes';
    editModeBtn.style.backgroundColor = 'var(--accent)';
    
    editableElements.forEach(el => {
        el.contentEditable = true;
        el.dataset.originalContent = el.textContent;
    });

    // Change button click handler
    editModeBtn.removeEventListener('click', showPasswordModal);
    editModeBtn.addEventListener('click', saveChanges);
}

async function saveChanges() {
    const updates = [];
    editableElements.forEach(el => {
        if (el.textContent !== el.dataset.originalContent) {
            updates.push({
                element: el,
                newContent: el.textContent,
                originalContent: el.dataset.originalContent
            });
        }
    });

    if (updates.length === 0) {
        disableEditMode();
        return;
    }

    try {
        // Get the current HTML content
        const response = await fetch('/api/fetch-content');
        let htmlContent = await response.text();

        // Apply updates to the HTML content
        updates.forEach(update => {
            htmlContent = htmlContent.replace(
                update.originalContent,
                update.newContent
            );
        });

        // Save the updated content
        const saveResponse = await fetch('/api/update-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filePath: 'players/template/index.html',
                content: htmlContent
            }),
        });

        const saveData = await saveResponse.json();

        if (saveData.success) {
            alert('Changes saved successfully!');
            disableEditMode();
        } else {
            alert('Error saving changes');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving changes');
    }
}

function disableEditMode() {
    isEditMode = false;
    editModeBtn.textContent = 'Edit Information';
    editModeBtn.style.backgroundColor = 'var(--primary)';
    
    editableElements.forEach(el => {
        el.contentEditable = false;
        delete el.dataset.originalContent;
    });

    // Reset button click handler
    editModeBtn.removeEventListener('click', saveChanges);
    editModeBtn.addEventListener('click', showPasswordModal);
}

function showPasswordModal() {
    passwordModal.classList.add('active');
}

// Initialize button click handler
editModeBtn.addEventListener('click', showPasswordModal);
