import { Router, Request, Response } from 'express';
import { generateTests } from '../services/llmService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { requirements, provider, apiKey, baseUrl, model, temperature } = req.body;

    if (!requirements || !provider) {
      return res.status(400).json({ error: 'Requirements and Provider are required.' });
    }

    const testCases = await generateTests({
      requirements,
      provider,
      apiKey,
      baseUrl,
      model,
      temperature
    });

    res.status(200).json({ testCases });
  } catch (error: any) {
    console.error('Error in /api/generate:', error.message);
    res.status(500).json({ error: error.message || 'An error occurred while generating tests.' });
  }
});

export default router;
