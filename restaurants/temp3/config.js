// config.js - Configuration file for restaurant website template

// Restaurant Information
const restaurantConfig = {
    // Basic Info
    name: "GUSTO",
    tagline: "Exceptional Cuisine, Unforgettable Experience",
    description: "Indulge in a culinary journey through flavors from around the world",
    foundedYear: 2010,
    story: "Founded in 2010, Gusto has been delighting patrons with exceptional cuisine and impeccable service. Our chefs combine traditional techniques with innovative approaches to create dishes that surprise and delight.",
    sourcingInfo: "Every ingredient is carefully sourced from local farmers and premium suppliers to ensure the highest quality dining experience.",
    
    // Contact Information
    phone: "(555) 123-4567",
    email: "info@gusto-restaurant.com",
    
    // Social Media
    social: {
        instagram: "#",
        facebook: "#",
        twitter: "#"
    },
    
    // Images
    images: {
        hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80", // Elegant restaurant interior
        about: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=1200&q=80", // Chef preparing food
        gallery: [
            "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&w=800&q=80", // Gourmet dish 1
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80", // Gourmet dish 2
            "https://berriesandspice.com/wp-content/uploads/2018/08/Berries-and-Spice-How-to-plate-dishes-worthy-of-a-fine-dining-restaurant-the-complete-guide-23-scaled.jpg", // Gourmet dish 3
            "https://media.istockphoto.com/id/1081422898/photo/pan-fried-duck.jpg?s=612x612&w=0&k=20&c=kzlrX7KJivvufQx9mLd-gMiMHR6lC2cgX009k9XO6VA="  // Gourmet dish 4
        ],
        locations: [
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80", // Downtown location
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=80", // Riverside location
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"  // Uptown location
        ],
        menuPreview: "https://images.unsplash.com/photo-1570037276380-c3ad95f7c427?auto=format&fit=crop&w=800&q=80" // Signature dish for menu preview
    },
    
    // Branding Colors
    colors: {
        primary: "#1a472a",    // Dark Forest Green
        secondary: "#2d5a27",  // Deep Emerald
        light: "#f5f5f5",      // Light Gray
        accent: "#8b4513",     // Saddle Brown
        dark: "#1a1a1a",       // Dark Gray
        text: "#333",          // Dark Gray
        gold: "#d4af37"        // Classic Gold
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
        { name: "Gallery", link: "#gallery" },
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
    
    // Menu Settings
    menu: {
        pdfPath: "https://drive.google.com/file/d/1Jc-HxtKP0N1K_0wRJpcitGxeHRTBbYka/view",
        downloadFileName: "Restaurant_Menu.pdf"
    },
    
    // Copyright Information
    copyright: {
        year: 2025,
        text: "Gusto Restaurant. All rights reserved."
    }
};

// Apply configuration to the website
document.addEventListener('DOMContentLoaded', function() {
    // Apply restaurant name
    document.title = `${restaurantConfig.name} | Fine Dining Experience`;
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
    // Hero image
    document.querySelector('.hero-image .chef-image').style.backgroundImage = 
        `url('${restaurantConfig.images.hero}')`;
    
    // About image
    document.querySelector('.about-image .chef-image').style.backgroundImage = 
        `url('${restaurantConfig.images.about}')`;
    
    // Gallery images
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.style.backgroundImage = `url('${restaurantConfig.images.gallery[index]}')`;
    });
    
    // Menu preview image
    document.querySelector('.menu-preview-img').src = restaurantConfig.images.menuPreview;
    
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
    
    // Apply menu information
    const downloadMenuBtn = document.getElementById('download-menu');
    downloadMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(restaurantConfig.menu.pdfPath, '_blank');
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
