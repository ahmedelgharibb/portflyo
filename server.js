const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('players'));

const GITHUB_TOKEN = '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'; // Replace with your GitHub token
const REPO_OWNER = 'ahmedelgharibb';
const REPO_NAME = 'portflyo';
const FILE_PATH = 'teachers/template/index.html';

// Fetch HTML content from GitHub
app.get('/fetch-content', async (req, res) => {
    try {
        const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        res.send(content);
    } catch (error) {
        res.status(500).send('Error fetching content from GitHub');
    }
});

// Update HTML content on GitHub
app.post('/update-content', async (req, res) => {
    const { content } = req.body;
    try {
        const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        const sha = response.data.sha;
        const updatedContent = Buffer.from(content).toString('base64');
        await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            message: 'Update HTML content',
            content: updatedContent,
            sha: sha
        }, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });
        res.send('Content updated successfully');
    } catch (error) {
        res.status(500).send('Error updating content on GitHub');
    }
});

// Endpoint to create a new player profile
app.post('/create-player', async (req, res) => {
    try {
        const { playerName } = req.body;
        
        if (!playerName) {
            return res.status(400).json({ message: 'Player name is required' });
        }

        // Create sanitized folder name
        const folderName = playerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const sourcePath = path.join(__dirname, 'players', 'template');
        const targetPath = path.join(__dirname, 'players', folderName);

        // Check if the player folder already exists
        try {
            await fs.access(targetPath);
            return res.status(400).json({ message: 'Player profile already exists' });
        } catch (err) {
            // Directory doesn't exist, we can proceed
        }

        // Copy template folder to new player folder
        await copyDirectory(sourcePath, targetPath);

        // Update the config.js file with the player's name
        const configPath = path.join(targetPath, 'config.js');
        let configContent = await fs.readFile(configPath, 'utf8');
        configContent = configContent.replace(/"name": "[^"]*"/, `"name": "${playerName}"`);
        await fs.writeFile(configPath, configContent);

        res.json({
            message: 'Player profile created successfully',
            url: `https://portflyo-kappa.vercel.app/players/${folderName}/index.html`
        });
    } catch (error) {
        console.error('Error creating player profile:', error);
        res.status(500).json({ message: 'Failed to create player profile' });
    }
});

// Helper function to copy directory recursively
async function copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(target, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


