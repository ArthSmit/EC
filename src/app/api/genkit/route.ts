import { genkitNextjsPlugin } from '@genkit-ai/next';
import { ai } from '@/ai/genkit';

export const { GET, POST } = genkitNextjsPlugin(ai);