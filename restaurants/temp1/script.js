// script.js - Main script file for restaurant website template

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '1rem 10%';
            header.style.boxShadow = '0 2px 10px rgba(26, 71, 42, 0.1)';
        } else {
            header.style.padding = '1.5rem 10%';
            header.style.boxShadow = '0 2px 5px rgba(26, 71, 42, 0.05)';
        }
    });

    // Modal functionality
    const locationsBtn = document.getElementById('locations-btn');
    const menuBtn = document.getElementById('menu-btn');
    const locationsModal = document.getElementById('locations-modal');
    const menuModal = document.getElementById('menu-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    
    // Open locations modal
    locationsBtn.addEventListener('click', () => {
        locationsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        animateLocations();
    });
    
    // Open menu modal
    menuBtn.addEventListener('click', () => {
        window.open('https://drive.google.com/file/d/1Jc-HxtKP0N1K_0wRJpcitGxeHRTBbYka/view', '_blank');
    });
    
    // Close modals when clicking close button
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            locationsModal.style.display = 'none';
            menuModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === locationsModal) {
            locationsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === menuModal) {
            menuModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Animate location cards
    function animateLocations() {
        const cards = document.querySelectorAll('.location-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => {
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });
    }

    // Intersection Observer for scroll animations
    const observeElements = document.querySelectorAll('.about, .gallery, .gallery-item');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Add fade-in class and initial styles
    observeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add the CSS for the animation
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Image hover effects for gallery
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px)';
            item.style.boxShadow = '0 5px 15px rgba(26, 71, 42, 0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
            item.style.boxShadow = '';
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}); 
