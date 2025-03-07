const express = require('express');
const { Octokit } = require('@octokit/rest');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// GitHub configuration from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "ahmedelgharibb";
const GITHUB_REPO = process.env.GITHUB_REPO || "portflyo";
const TEMPLATE_DIR = process.env.TEMPLATE_DIR || "teachers/template";

// Create octokit instance with GitHub token
const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// API endpoint to create teacher website
app.post('/api/create-teacher-website', async (req, res) => {
  try {
    // Set Content-Type header explicitly
    res.setHeader('Content-Type', 'application/json');
    
    const { name, subject, slug } = req.body;
    
    console.log("Received request:", { name, subject, slug });
    
    // Validate inputs
    if (!name || !subject || !slug) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Get template files
    const [indexTemplate, scriptTemplate, stylesTemplate] = await Promise.all([
      getFileContent(`${TEMPLATE_DIR}/index.html`),
      getFileContent(`${TEMPLATE_DIR}/script.js`),
      getFileContent(`${TEMPLATE_DIR}/styles.css`)
    ]);
    
    // Process templates with teacher data
    const teacherData = {
      TEACHER_NAME: name,
      TEACHER_SUBJECT: subject,
      TEACHER_SLUG: slug
    };
    
    const indexHtml = processTemplate(indexTemplate, teacherData);
    const scriptJs = processTemplate(scriptTemplate, teacherData);
    const stylesCss = stylesTemplate; // No processing needed if no placeholders
    
    // Create teacher directory and files in GitHub
    const teacherDir = `teachers/${slug}`;
    
    await Promise.all([
      createOrUpdateFile(
        `${teacherDir}/index.html`, 
        indexHtml, 
        `Create website for ${name}`
      ),
      createOrUpdateFile(
        `${teacherDir}/script.js`, 
        scriptJs, 
        `Create website for ${name}`
      ),
      createOrUpdateFile(
        `${teacherDir}/styles.css`, 
        stylesCss, 
        `Create website for ${name}`
      )
    ]);
    
    // Optionally trigger GitHub Pages deployment workflow
    try {
      await triggerGitHubAction(slug, name);
    } catch (workflowError) {
      console.warn("Warning: Could not trigger GitHub workflow:", workflowError.message);
      // Continue even if workflow trigger fails
    }
    
    // Return success with website URL
    const websiteUrl = `https://${GITHUB_OWNER}.github.io/${GITHUB_REPO}/teachers/${slug}/`;
    
    console.log("Success response:", { 
      message: "Teacher website created successfully",
      slug: slug,
      websiteUrl: websiteUrl
    });
    
    return res.status(201).json({
      message: "Teacher website created successfully",
      slug: slug,
      websiteUrl: websiteUrl
    });
  } catch (error) {
    console.error("Error creating teacher website:", error);
    return res.status(500).json({ message: "Failed to create teacher website: " + error.message });
  }
});

/**
 * Get file content from GitHub repository
 * @param {string} path - File path in the repository
 * @returns {Promise<string>} - File content as string
 */
async function getFileContent(path) {
  try {
    const response = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path
    });
    
    // Decode base64 content
    return Buffer.from(response.data.content, 'base64').toString('utf8');
  } catch (error) {
    console.error(`Error getting file ${path}:`, error);
    throw new Error(`Failed to get template file: ${path}`);
  }
}

/**
 * Process template by replacing placeholders with actual values
 * @param {string} template - Template string
 * @param {Object} data - Data object with replacement values
 * @returns {string} - Processed template
 */
function processTemplate(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

/**
 * Create or update a file in GitHub repository
 * @param {string} path - File path to create/update
 * @param {string} content - File content
 * @param {string} message - Commit message
 */
async function createOrUpdateFile(path, content, message) {
  try {
    // Check if file exists
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: path
      });
      sha = data.sha;
    } catch (error) {
      // File doesn't exist, which is fine
    }
    
    // Create or update file
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path,
      message: message,
      content: Buffer.from(content).toString('base64'),
      sha: sha
    });
  } catch (error) {
    console.error(`Error creating/updating file ${path}:`, error);
    throw new Error(`Failed to create/update file: ${path}`);
  }
}

/**
 * Trigger GitHub workflow to deploy teacher website
 * @param {string} slug - Teacher slug
 * @param {string} name - Teacher name
 */
async function triggerGitHubAction(slug, name) {
  try {
    await octokit.repos.createDispatchEvent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      event_type: "deploy-teacher-website",
      client_payload: {
        teacher_slug: slug,
        teacher_name: name
      }
    });
  } catch (error) {
    console.error("Error triggering GitHub workflow:", error);
    throw new Error("Failed to trigger deployment workflow");
  }
}

// Handle 404s
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  next();
});

// Serve frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
