export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { name, species, age, notes } = request.body;

  const prompt = buildPrompt({ name, species, age, notes });

  try {
    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          messages: [{ role: "user", content: prompt }],
        }),
      },
    );

    const data = await claudeResponse.json();
    if (data.error)
      return response.status(500).json({ error: "Failed to generate bio" });

    const bio = data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return response.status(200).json({ bio });
  } catch (error) {
    return response.status(500).json({ error: "Failed to generate bio" });
  }
}

function buildPrompt({ name, species, age, notes }) {
  return `You are helping a shelter volunteer write an adoption bio for an animal.

Details:
- Name: ${name}
- Species: ${species}
- Age: ${age}
- Notes: ${notes}

Write a warm, honest adoption bio of 2-3 short sentences that would make
someone want to adopt this animal. Only use the details above. Do not invent
facts. Write in a friendly tone and as if you are a volunteer. Avoid these AI-writing tells:
- Clichés: "furry friend," "furbaby," "perfect companion," "steal your heart,"
  "forever home" as filler, and forced puns like "purr-fect."
- Empty intensifiers: "truly," "incredibly," "absolutely," "simply."
- Vague praise. Use the specific details from the notes, not generic traits.
- Rule-of-three lists of adjectives.
- A formulaic hook-then-call-to-action template.
- Over-the-top emotional closes like "Will you be her hero?"

Instead: write plainly and specifically, like a volunteer who actually knows
this animal. Prefer one concrete detail over three generic adjectives. Vary
sentence length. It's okay to be understated.

Include a short, catchy title for the bio, like "Meet [Name]!" or "[Name] is waiting for you!" at the top,
as plain text only. Do not use markdown formatting anywhere in the output (no "#" heading markers,
no asterisks, no bullet points). Do not include any em dashes or contractions either. Do not include any emojis.`;
}
