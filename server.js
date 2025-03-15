const express = require('express');
const axios = require('axios');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'your_github_token';
const REPO_OWNER = 'ahmedelgharibb';
const REPO_NAME = 'portflyo';
const FILE_PATH = 'teachers/template/index.html';

// This would typically be in a database
const HASHED_PASSWORD = '$2b$10$nAKppWV9A1YFAJ6aSRUC.e5twkHXoNeavaWIH8PywV2ajnLaPsP2i';

// Authentication endpoint
app.post('/api/auth', async (req, res) => {
    const { password } = req.body;
    try {
        const match = await bcrypt.compare(password, HASHED_PASSWORD);
        if (match) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update content endpoint
app.post('/api/update-content', async (req, res) => {
    const { filePath, content } = req.body;
    try {
        // Get the current file to get its SHA
        const currentFile = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });

        // Update the file
        await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
            message: 'Update content via CMS',
            content: Buffer.from(content).toString('base64'),
            sha: currentFile.data.sha
        }, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ success: false, message: 'Error updating content' });
    }
});

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


