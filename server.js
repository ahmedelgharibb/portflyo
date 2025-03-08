const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


