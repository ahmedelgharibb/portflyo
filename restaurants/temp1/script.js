// script.js - Main JavaScript file for restaurant website

// DOM Elements
const locationsModal = document.getElementById('locations-modal');
const locationsBtn = document.getElementById('locations-btn');
const closeBtns = document.querySelectorAll('.close-btn');
const writeReviewBtn = document.getElementById('write-review');
const locationsContainer = document.querySelector('.locations-container');
const galleryGrid = document.querySelector('.gallery-grid');

// Gallery Images with Descriptions
const galleryImages = [
    { title: "Restaurant Ambiance", description: "Elegant dining area with modern decor" },
    { title: "Signature Dishes", description: "Our chef's special creations" },
    { title: "Fresh Ingredients", description: "Premium quality ingredients" },
    { title: "Outdoor Seating", description: "Beautiful outdoor dining experience" },
    { title: "Bar Area", description: "Stylish bar with craft cocktails" },
    { title: "Private Events", description: "Perfect space for special occasions" }
];

// Event Listeners
locationsBtn.addEventListener('click', () => {
    // Populate locations before showing modal
    populateLocations();
    locationsModal.style.display = 'block';
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        locationsModal.style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === locationsModal) {
        locationsModal.style.display = 'none';
    }
});

// Function to populate locations
function populateLocations() {
    if (!restaurantConfig.locations || !restaurantConfig.images.locations) {
        console.error('Locations data is missing in config');
        return;
    }

    locationsContainer.innerHTML = '';
    restaurantConfig.locations.forEach((location, index) => {
        const locationCard = document.createElement('div');
        locationCard.className = 'location-card';
        locationCard.innerHTML = `
            <div class="location-image" style="background-image: url('${restaurantConfig.images.locations[index]}')"></div>
            <h3>${location.name}</h3>
            <p><i class="fas fa-map-marker-alt"></i> ${location.address}</p>
            <p><i class="fas fa-clock"></i> ${location.hours}</p>
            <a href="${location.mapLink}" target="_blank" class="location-link">
                <i class="fas fa-directions"></i> Get Directions
            </a>
        `;
        locationsContainer.appendChild(locationCard);
    });
}

// Function to populate gallery
function populateGallery() {
    if (!restaurantConfig.images.gallery) {
        console.error('Gallery images are missing in config');
        return;
    }

    galleryGrid.innerHTML = '';
    restaurantConfig.images.gallery.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <div class="gallery-image" style="background-image: url('${image}')"></div>
            <div class="gallery-overlay">
                <h3>${galleryImages[index].title}</h3>
                <p>${galleryImages[index].description}</p>
            </div>
        `;
        galleryGrid.appendChild(galleryItem);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    populateGallery();
    // ... existing event listeners ...
});

// Handle review button click
writeReviewBtn.addEventListener('click', () => {
    if (restaurantConfig.googleReviews.placeId) {
        window.open(`https://search.google.com/local/writereview?placeid=${restaurantConfig.googleReviews.placeId}`, '_blank');
    } else {
        alert('Google Place ID is not configured. Please contact the restaurant administrator.');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        // Scroll Down
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        // Scroll Up
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Add animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('animated');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Utility function for notifications
function createNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 
