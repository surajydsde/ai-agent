import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// SSE endpoint for streaming chat
app.post('/api/chat', async (req, res) => {
  const { messages, model } = req.body;
  const prompt = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

  try {
    const ollamaStream = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'llama3',
        prompt,
        stream: true,
      }),
    });

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const decoder = new TextDecoder();
    for await (const chunk of ollamaStream.body) {
      const text = decoder.decode(chunk);
      const lines = text.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`);
          }
          if (json.done) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
            return;
          }
        } catch (e) {
          console.error('Streaming parse error:', e);
        }
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Streaming failed' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Streaming server running at http://localhost:${PORT}`));
