// config.js - Configuration file for restaurant website template

// Restaurant Information
const restaurantConfig = {
    // Basic Info
    name: "GUSTO",
    tagline: "Modern Dining Experience",
    description: "Experience the perfect blend of flavors and ambiance",
    foundedYear: 2010,
    story: "Founded in 2010, Gusto has been delighting patrons with exceptional cuisine and impeccable service. Our chefs combine traditional techniques with innovative approaches to create dishes that surprise and delight.",
    sourcingInfo: "Every ingredient is carefully sourced from local farmers and premium suppliers to ensure the highest quality dining experience.",
    
    // Contact Information
    phone: "(555) 123-4567",
    email: "info@gusto-restaurant.com",
    whatsapp: "https://wa.me/1234567890", // Replace with actual WhatsApp number
    
    // Social Media
    social: {
        instagram: "#",
        facebook: "#",
        twitter: "#"
    },
    
    // Images
    images: {
        hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
        about: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=1200&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
        ],
        locations: [
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"
        ]
    },
    
    // Branding Colors
    colors: {
        primary: "#FF4B2B",    // Modern Red
        secondary: "#2B2B2B",  // Dark Gray
        accent: "#FFD700",     // Gold
        text: "#333333",       // Dark Gray
        light: "#FFFFFF",      // White
        gray: "#F5F5F5",       // Light Gray
        dark: "#1A1A1A"        // Dark Gray
    },
    
    // Particles Animation Settings
    particles: {
        color: "#1a472a",      // Dark Forest Green
        linkColor: "#d4af37",  // Gold
        number: 80,            // Number of particles
        speed: 2,              // Movement speed
        opacity: 0.2           // Opacity of particles
    },
    
    // Header Navigation
    navigation: [
        { name: "About", link: "#about" },
        { name: "Offers", link: "#offers" },
        { name: "Gallery", link: "#gallery" },
        { name: "Reviews", link: "#reviews" },
        { name: "Contact", link: "#contact" }
    ],
    
    // Locations
    locations: [
        {
            name: "Downtown",
            address: "123 Main Street, City Center",
            hours: "Open daily: 11:00 AM - 10:00 PM",
            mapLink: "https://maps.google.com"
        },
        {
            name: "Riverside",
            address: "456 Water Avenue, River District",
            hours: "Open daily: 11:00 AM - 11:00 PM",
            mapLink: "https://maps.google.com"
        },
        {
            name: "Uptown",
            address: "789 High Street, North Side",
            hours: "Open daily: 12:00 PM - 10:00 PM",
            mapLink: "https://maps.google.com"
        }
    ],
    
    // Special Offers
    offers: [
        {
            title: "Weekend Brunch Special",
            description: "Enjoy our signature brunch menu with bottomless mimosas",
            image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
            validUntil: "Every Weekend"
        },
        {
            title: "Happy Hour",
            description: "50% off appetizers and special drink prices",
            image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
            validUntil: "Mon-Fri, 4-7 PM"
        },
        {
            title: "Date Night Special",
            description: "3-course meal for two with a bottle of wine",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
            validUntil: "Every Thursday"
        }
    ],
    
    // Google Reviews Settings
    googleReviews: {
        placeId: "YOUR_GOOGLE_PLACE_ID", // Replace with actual Google Place ID
        apiKey: "YOUR_GOOGLE_API_KEY",    // Replace with actual Google API Key
        maxReviews: 3
    },
    
    // Copyright Information
    copyright: {
        year: 2024,
        text: "Gusto Restaurant. All rights reserved."
    }
};

// Apply configuration to the website
document.addEventListener('DOMContentLoaded', function() {
    // Apply restaurant name
    document.title = `${restaurantConfig.name} | Modern Dining Experience`;
    document.querySelectorAll('.logo h1, .footer-logo h2').forEach(el => {
        el.textContent = restaurantConfig.name;
    });
    
    // Apply hero content
    document.querySelector('.hero-content h2').innerHTML = restaurantConfig.tagline;
    document.querySelector('.hero-content p').textContent = restaurantConfig.description;
    
    // Apply about section
    const aboutSection = document.querySelector('.about-content');
    aboutSection.querySelector('p:first-of-type').textContent = restaurantConfig.story;
    aboutSection.querySelector('p:last-of-type').textContent = restaurantConfig.sourcingInfo;
    
    // Apply navigation
    const navList = document.querySelector('nav ul');
    navList.innerHTML = '';
    restaurantConfig.navigation.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.link;
        a.textContent = item.name;
        li.appendChild(a);
        navList.appendChild(li);
    });
    
    // Apply contact info
    document.querySelector('.contact-info p:nth-child(2)').innerHTML = 
        `<i class="fas fa-phone"></i> ${restaurantConfig.phone}`;
    document.querySelector('.contact-info p:nth-child(3)').innerHTML = 
        `<i class="fas fa-envelope"></i> ${restaurantConfig.email}`;
    
    // Apply WhatsApp button
    const whatsappBtn = document.getElementById('whatsapp-btn');
    whatsappBtn.href = restaurantConfig.whatsapp;
    
    // Apply social links
    const socialLinks = document.querySelector('.social-links');
    socialLinks.innerHTML = '';
    Object.entries(restaurantConfig.social).forEach(([platform, link]) => {
        const a = document.createElement('a');
        a.href = link;
        a.className = 'social-icon';
        a.innerHTML = `<i class="fab fa-${platform}"></i>`;
        socialLinks.appendChild(a);
    });
    
    // Apply copyright
    document.querySelector('.copyright p').textContent = 
        `© ${restaurantConfig.copyright.year} ${restaurantConfig.copyright.text}`;
    
    // Apply images
    document.querySelector('.hero-image .chef-image').style.backgroundImage = 
        `url('${restaurantConfig.images.hero}')`;
    
    document.querySelector('.about-image .chef-image').style.backgroundImage = 
        `url('${restaurantConfig.images.about}')`;
    
    // Apply gallery images
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.style.backgroundImage = `url('${restaurantConfig.images.gallery[index]}')`;
    });
    
    // Apply offers
    const offersGrid = document.querySelector('.offers-grid');
    offersGrid.innerHTML = '';
    restaurantConfig.offers.forEach(offer => {
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        offerCard.innerHTML = `
            <div class="offer-image" style="background-image: url('${offer.image}')"></div>
            <div class="offer-content">
                <h3>${offer.title}</h3>
                <p>${offer.description}</p>
                <p class="offer-validity">Valid: ${offer.validUntil}</p>
            </div>
        `;
        offersGrid.appendChild(offerCard);
    });
    
    // Apply locations
    const locationsContainer = document.querySelector('.locations-container');
    locationsContainer.innerHTML = '';
    restaurantConfig.locations.forEach((location, index) => {
        const div = document.createElement('div');
        div.className = 'location-card';
        div.innerHTML = `
            <div class="location-image" style="background-image: url('${restaurantConfig.images.locations[index]}')"></div>
            <h3>${location.name}</h3>
            <p>${location.address}</p>
            <p>${location.hours}</p>
            <a href="${location.mapLink}" target="_blank" class="location-link">Get Directions</a>
        `;
        locationsContainer.appendChild(div);
    });
    
    // Apply color scheme
    const root = document.documentElement;
    Object.entries(restaurantConfig.colors).forEach(([name, value]) => {
        root.style.setProperty(`--${name}-color`, value);
    });
    
    // Apply particles configuration
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": restaurantConfig.particles.number,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": restaurantConfig.particles.color
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": restaurantConfig.particles.opacity,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": restaurantConfig.particles.linkColor,
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": restaurantConfig.particles.speed,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.5
                        }
                    },
                    "push": {
                        "particles_nb": 4
                    }
                }
            },
            "retina_detect": true
        });
    }
});

// Function to load Google Reviews
async function loadGoogleReviews() {
    if (!restaurantConfig.googleReviews.placeId || !restaurantConfig.googleReviews.apiKey) {
        console.warn('Google Reviews configuration is missing');
        return;
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurantConfig.googleReviews.placeId}&fields=reviews&key=${restaurantConfig.googleReviews.apiKey}`
        );
        const data = await response.json();

        if (data.result && data.result.reviews) {
            const reviewsContainer = document.getElementById('google-reviews');
            reviewsContainer.innerHTML = '';

            data.result.reviews
                .slice(0, restaurantConfig.googleReviews.maxReviews)
                .forEach(review => {
                    const reviewCard = document.createElement('div');
                    reviewCard.className = 'review-card';
                    reviewCard.innerHTML = `
                        <div class="review-header">
                            <div class="reviewer-image" style="background-image: url('${review.profile_photo_url}')"></div>
                            <div class="reviewer-name">${review.author_name}</div>
                        </div>
                        <div class="review-stars">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                        </div>
                        <div class="review-text">${review.text}</div>
                    `;
                    reviewsContainer.appendChild(reviewCard);
                });
        }
    } catch (error) {
        console.error('Error loading Google Reviews:', error);
    }
}

// Load Google Reviews when the page loads
document.addEventListener('DOMContentLoaded', loadGoogleReviews);

// Utility function for notifications
function createNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
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
