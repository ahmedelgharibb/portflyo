# SportsScout Player Portfolio

A dynamic, editable portfolio website for sports players.

## Setup

1. Clone the repository
2. Set up Supabase configuration:
   - Copy `players/edit-temp/supabase-config.template.js` to `players/edit-temp/supabase-config.js`
   - Replace `YOUR_SUPABASE_URL` with your Supabase project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase anonymous key
   - **Note**: Never commit `supabase-config.js` to version control

## Features

- Dynamic content management through Supabase
- In-place editing with password protection
- Responsive design
- Contact form integration
- Timeline and achievements showcase
- Statistics and physical information display

## Development

The site uses vanilla JavaScript with ES modules and Supabase for data storage. All content is configurable through the admin interface. 