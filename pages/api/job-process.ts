import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai'; // ✅ Fixed import

const BOT_TOKEN = '8183313796:AAGjiiC2I_sx9OFxlb7d8T5xVaZKT3ZGLfI';
const CHAT_ID = '@ca_jobss';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ env variable
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { raw_text } = req.body;

  if (!raw_text) {
    return res.status(400).json({ error: 'Missing job content' });
  }

  try {
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Format LinkedIn job posts into a neat and professional message for Telegram.',
        },
        {
          role: 'user',
          content: raw_text,
        },
      ],
      temperature: 0.5,
    });

    const finalText = gptResponse.choices[0]?.message?.content?.trim();

    if (!finalText) {
      return res.status(500).json({ error: 'No response from GPT' });
    }

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: finalText }),
    });

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
