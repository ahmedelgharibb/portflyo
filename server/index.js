require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Use environment variables for sensitive information
const GITHUB_TOKEN = process.env.MY_GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER || 'ahmedelgharibb';
const REPO_NAME = process.env.REPO_NAME || 'portflyo';
const FILE_PATH = process.env.FILE_PATH || 'teachers/template/index.html';

// Error handling middleware
const handleGitHubError = (error, res) => {
  console.error('GitHub API Error:', error.message);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Response:', error.response.data);
    res.status(error.response.status).send(`Error: ${error.response.data.message || 'GitHub API error'}`);
  } else {
    res.status(500).send('Error connecting to GitHub API');
  }
};

// Fetch HTML content from GitHub
app.get('/fetch-content', async (req, res) => {
    try {
        if (!GITHUB_TOKEN) {
            return res.status(500).send('GitHub token not configured');
        }
        
        const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${MY_GITHUB_TOKEN}`
            }
        });
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        res.send(content);
    } catch (error) {
        handleGitHubError(error, res);
    }
});

// Update HTML content on GitHub
app.post('/update-content', async (req, res) => {
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).send('Content is required');
    }
    
    try {
        if (!MY_GITHUB_TOKEN) {
            return res.status(500).send('GitHub token not configured');
        }
        
        const response = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${MY_GITHUB_TOKEN}`
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
                'Authorization': `token ${MY_GITHUB_TOKEN}`
            }
        });
        res.send('Content updated successfully');
    } catch (error) {
        handleGitHubError(error, res);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
