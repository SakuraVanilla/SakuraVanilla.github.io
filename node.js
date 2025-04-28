const express = require('express');
const axios = require('axios');
const app = express();
const fs = require('fs');
const { Octokit } = require('@octokit/rest');

// GitHub setup
const octokit = new Octokit({ auth: 'your-github-token' });
const owner = 'your-github-username';
const repo = 'your-repo-name';
const filePath = 'player_scores.json';

// Function to update the player scores JSON file on GitHub
async function updateGitHubFile(data) {
    // Fetch the current file contents from GitHub
    const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
    });

    const currentFileContent = Buffer.from(fileData.content, 'base64').toString();
    const parsedData = JSON.parse(currentFileContent);

    // Update the player scores
    Object.assign(parsedData, data);

    // Update the file on GitHub
    await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: 'Update player scores',
        content: Buffer.from(JSON.stringify(parsedData, null, 2)).toString('base64'),
        sha: fileData.sha, // Get file sha for the update
    });
}

// Set up the Express API
app.use(express.json());

app.post('/update-scores', async (req, res) => {
    const { playerName, score } = req.body;
    if (!playerName || !score) {
        return res.status(400).send('Missing playerName or score');
    }

    const scoreData = { [playerName]: score };

    try {
        await updateGitHubFile(scoreData);
        res.status(200).send('Scores updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update scores');
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
