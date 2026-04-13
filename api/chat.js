export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { messages, system, webSearch } = req.body;
  try {
    const body = {
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: system,
      messages: messages
    };
    if (webSearch) {
      body.tools = [{
        type: 'web_search_20250305',
        name: 'web_search'
      }];
    }
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    const textContent = data.content?.find(c => c.type === 'text');
    if (textContent) {
      res.status(200).json({ content: [textContent] });
    } else {
      res.status(200).json(data);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error connecting to Claude' });
  }
}
