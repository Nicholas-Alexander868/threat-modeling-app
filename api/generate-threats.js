const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Please provide a system description' });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a security threat modeling expert. Given this system description, generate a threat model in valid JSON only, no other text, matching this exact structure:

{
  "systemOverview": "short paragraph",
  "assets": ["asset1", "asset2"],
  "threatActors": ["actor1", "actor2"],
  "trustBoundaries": ["boundary1", "boundary2"],
  "threats": [
    {
      "name": "threat name",
      "severity": "Critical|High|Medium|Low",
      "description": "description",
      "likelihood": "High|Medium|Low",
      "impact": "Critical|High|Medium|Low",
      "attackPath": "description of how the attack unfolds",
      "frameworks": [{"source": "MITRE ATT&CK", "id": "T1059"}],
      "mitigations": ["mitigation1", "mitigation2"]
    }
  ]
}

System description: ${description}`,
        },
      ],
    });

    const responseText = message.content[0].text;
    const threatModel = JSON.parse(responseText);

    res.status(200).json(threatModel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate threat model' });
  }
};