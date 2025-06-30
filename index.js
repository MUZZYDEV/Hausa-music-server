const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
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

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'video/mp4');

  const command = `yt-dlp -o - "${url}"`; // no format selection

  const process = exec(command, { maxBuffer: 1024 * 1024 * 100 });

  process.stdout.pipe(res);

  process.stderr.on('data', data => {
    console.error('Download error:', data.toString());
  });

  process.on('exit', code => {
    if (code !== 0) {
      console.error(`yt-dlp exited with code ${code}`);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
