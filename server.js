const axios = require('axios');
const fs = require('fs');

// Replace with your GitHub repository details
const owner = 'your-github-username';  // GitHub username
const repo = 'your-repo-name';  // GitHub repository name
const filePath = 'player_scores.json';  // Path to the JSON file in the repository
const githubToken = 'your-personal-access-token';  // GitHub Personal Access Token

// GitHub API URL to fetch file content
const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

// Function to update the JSON file on GitHub
async function updateGitHubFile(data) {
    try {
        // Fetch the current file content from GitHub
        const response = await axios.get(githubApiUrl, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        const fileData = response.data;
        const currentContent = Buffer.from(fileData.content, 'base64').toString();
        const jsonContent = JSON.parse(currentContent);

        // Update the player scores in the JSON
        Object.assign(jsonContent, data);

        // Update the file on GitHub with the new content
        await axios.put(githubApiUrl, {
            message: 'Update player scores',
            content: Buffer.from(JSON.stringify(jsonContent, null, 2)).toString('base64'),
            sha: fileData.sha,
        }, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        console.log('GitHub file updated successfully!');
    } catch (error) {
        console.error('Error updating GitHub file:', error);
    }
}

// Sample usage (you can call this function from Minecraft script)
updateGitHubFile({ 'PlayerOne': { score: 1300, tier: 'Platinum' } });
