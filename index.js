const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.get('/download', async (req, res) => {
  try {
    const videoId = req.query.videoId;

    if (!videoId) {
      return res.status(400).json({ error: 'Missing video ID' });
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const fileName = `hausa-music-${videoId}.mp4`;
    const filePath = path.join(__dirname, fileName);

    // Command to download best quality with yt-dlp
    const cmd = `yt-dlp -f best -o "${filePath}" "${videoUrl}"`;

    console.log('Downloading:', videoUrl);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Download error:', stderr);
        return res.status(500).json({ error: 'Failed to download video' });
      }

      // Send file to client
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Send error:', err);
        }

        // Delete file after sending
        fs.unlink(filePath, () => {});
      });
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});