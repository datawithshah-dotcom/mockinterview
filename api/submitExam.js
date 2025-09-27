const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = "datawithshah-dotcom";
const repo = "mockinterview";
const path = "mockHistory.json";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
    
    const newRecord = req.body;

    try {
        // Get current file from GitHub
        const { data: fileData } = await octokit.repos.getContent({ owner, repo, path });
        const content = Buffer.from(fileData.content, "base64").toString();
        const json = JSON.parse(content);

        // Add serial number
        newRecord.serial = json.length + 1;
        json.push(newRecord);

        // Commit updated file
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: `Add exam record #${newRecord.serial}`,
            content: Buffer.from(JSON.stringify(json, null, 2)).toString("base64"),
            sha: fileData.sha
        });

        res.status(200).json({status:"success", serial:newRecord.serial});
    } catch (err) {
        console.error(err);
        res.status(500).json({status:"error", message:err.message});
    }
}
