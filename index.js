const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/download', (req, res) => {
  const videoId = req.query.videoId;

  if (!videoId) {
    return res.status(400).json({ error: 'Missing video ID' });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const filename = `hausa-music-${videoId}.mp4`;
  const filePath = path.join(__dirname, filename);

  // yt-dlp command: download best audio+video and merge
  const command = `yt-dlp -f best -o "${filePath}" "${url}"`;

  console.log('Running command:', command);

  exec(command, { maxBuffer: 1024 * 1024 * 200 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Download error:', stderr);
      return res.status(500).json({ error: 'Failed to download video' });
    }

    // Set headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    // Create a stream to send the file
    const stream = fs.createReadStream(filePath);

    stream.pipe(res);

    stream.on('close', () => {
      // Delete temp file after sending
      fs.unlink(filePath, err => {
        if (err) console.error('Failed to delete file:', err);
      });
    });

    stream.on('error', err => {
      console.error('Stream error:', err);
      res.status(500).end();
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
