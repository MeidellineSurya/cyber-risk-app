import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function enrichRisk(
  risk: string,
  companyType: string
): Promise<{ description: string; businessImpact: string; mitigation: string }> {
  const chat = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are a cybersecurity analyst. A ${companyType} company has this risk: "${risk}".
        
Respond in this exact JSON format with no markdown, no explanation, just JSON:
{
  "description": "1-2 sentence technical explanation of the vulnerability",
  "businessImpact": "1-2 sentence explanation of business/financial impact",
  "mitigation": "1-2 sentence specific fix or control"
}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  const content = chat.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content);
  } catch {
    return {
      description: "Could not generate description.",
      businessImpact: "Could not assess business impact.",
      mitigation: "Review this risk manually.",
    };
  }
}