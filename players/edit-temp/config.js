import supabase from './supabase-config.js';

let config = {
    // Personal Information
    personalInfo: {
        name: "John Doe",
        title: "Professional Athlete | Champion | Motivational Speaker",
        bio: "With over 10 years of experience in the sports industry, I have achieved numerous accolades and continue to push the boundaries of excellence. My journey is a testament to hard work, dedication, and passion.",
        contact: {
            phone: "+1 234 567 890",
            email: "john.doe@sportscout.com",
            address: "123 Sports Ave, Champion City"
        }
    },

    // Site Branding
    branding: {
        name: "SportsScout"
    },

    // Physical Information
    physicalInfo: {
        height: "6'2\" (188 cm)",
        weight: "180 lbs (82 kg)",
        age: "25",
        position: "Forward"
    },

    // Statistics
    stats: {
        matchesPlayed: "150+",
        tournamentsWon: "50+",
        trainingSessions: "100+",
        yearsExperience: "10+"
    },

    // Career Timeline
    timeline: [
        {
            year: "2010",
            title: "Started Professional Career",
            description: "Began my journey as a professional athlete, competing in local tournaments."
        },
        {
            year: "2015",
            title: "First Major Win",
            description: "Won my first major tournament, marking a turning point in my career."
        },
        {
            year: "2020",
            title: "International Recognition",
            description: "Gained international recognition after winning a global championship."
        }
    ],

    // Images
    images: {
        hero: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=2069&auto=format&fit=crop",
        about: "https://media.istockphoto.com/id/1368151370/photo/portrait-of-happy-male-soccer-player.jpg?s=612x612&w=0&k=20&c=4yJHKcKeR7uGgBeBrF1WlGBpX4pXP7znzm0xkr5J-Yk=",
        gallery: [
            {
                image: "gallery-image-1.jpg",
                title: "Training Session",
                subtitle: "Intense workout routine"
            }
        ]
    },

    // Testimonials
    testimonials: [
        {
            text: "John is one of the most dedicated athletes I have ever worked with. His commitment to excellence is unparalleled.",
            author: "Coach Smith"
        }
    ],

    // Social Media Links
    socialMedia: {
        facebook: "https://facebook.com/johndoe",
        instagram: "https://instagram.com/johndoe",
        twitter: "https://twitter.com/johndoe"
    },

    // Theme Colors (CSS Variables)
    theme: {
        primary: "#007bff",
        secondary: "#6c757d",
        accent: "#28a745",
        background: "#ffffff",
        text: "#333333",
        heading: "#222222",
        border: "#e9ecef",
        cardBackground: "#f8f9fa"
    },

    // Achievements
    achievements: [
        {
            icon: "🏆",
            title: "Championship Title",
            description: "Won the National Championship in 2022"
        },
        {
            icon: "🥇",
            title: "MVP Award",
            description: "Most Valuable Player 2021 Season"
        },
        {
            icon: "🌟",
            title: "All-Star Selection",
            description: "Selected for All-Star Team 3 consecutive years"
        },
        {
            icon: "📈",
            title: "Record Holder",
            description: "Set new league record for most points in a season"
        }
    ],

    // Security
    security: {
        editPassword: "admin123" // This will be hashed in the database
    }
};

// Function to load config from Supabase
async function loadConfig() {
    try {
        const { data, error } = await supabase
            .from('player_configs')
            .select('*')
            .single();

        if (error) throw error;
        if (data) {
            config = { ...config, ...data };
        } else {
            // If no config exists, create one
            const { error: insertError } = await supabase
                .from('player_configs')
                .insert([config]);
            if (insertError) throw insertError;
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Function to save config to Supabase
async function saveConfig(newConfig) {
    try {
        const { error } = await supabase
            .from('player_configs')
            .upsert(newConfig);
        
        if (error) throw error;
        config = { ...config, ...newConfig };
        return true;
    } catch (error) {
        console.error('Error saving config:', error);
        return false;
    }
}

// Initialize config
await loadConfig();

export { config as default, saveConfig }; 
