document.addEventListener('DOMContentLoaded', function() {
    // Add current year to footer
    const year = new Date().getFullYear();
    const footerText = document.querySelector('footer p');
    footerText.innerHTML = footerText.innerHTML.replace('2025', year);
    
    // Simple animation for page elements
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
    });
});
