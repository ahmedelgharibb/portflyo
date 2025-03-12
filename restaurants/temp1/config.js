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
    
    // Branding Colors
    colors: {
        primary: "#e63946",    // Red accent
        secondary: "#1d3557",  // Dark blue
        light: "#f1faee",      // Off-white
        accent: "#457b9d",     // Medium blue
        dark: "#1d3557",       // Dark blue
        text: "#333",          // Dark gray
        gold: "#d4af37"        // Gold accent
    },
    
    // Particles Animation Settings
    particles: {
        color: "#e63946",      // Particle color
        linkColor: "#d4af37",  // Link color between particles
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
        pdfPath: "menu.pdf",
        downloadFileName: "Gusto_Restaurant_Menu.pdf"
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
    
    // Apply locations
    const locationsContainer = document.querySelector('.locations-container');
    locationsContainer.innerHTML = '';
    restaurantConfig.locations.forEach(location => {
        const div = document.createElement('div');
        div.className = 'location-card';
        div.innerHTML = `
            <div class="location-image" style="background-image: url('/api/placeholder/300/200')"></div>
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
        const dummyPdfPath = restaurantConfig.menu.pdfPath;
        createNotification('Menu downloaded successfully!');
        
        // Uncomment for actual implementation
        /*
        const link = document.createElement('a');
        link.href = dummyPdfPath;
        link.download = restaurantConfig.menu.downloadFileName;
        link.click();
        */
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
                            "opacity": 0.8
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
});

// Helper functions
function createNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    // Add styles dynamically
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    notification.style.zIndex = '1000';
    notification.style.transform = 'translateY(100px)';
    notification.style.opacity = '0';
    notification.style.transition = 'all 0.5s ease';
    
    // Style the content
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.display = 'flex';
    notificationContent.style.alignItems = 'center';
    
    // Style the icon
    const icon = notification.querySelector('i');
    icon.style.marginRight = '10px';
    icon.style.fontSize = '1.5rem';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}
