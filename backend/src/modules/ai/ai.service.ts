import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as https from 'https';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

@Injectable()
export class AiService {
    private readonly OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    private readonly MODEL = 'mistralai/mistral-7b-instruct:free';
    private readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    private buildSystemPrompt(userRole: string, universityName?: string): string {
        return `You are EduCore AI, an intelligent assistant embedded in the EduCore University ERP System.
${universityName ? `You are currently assisting staff at ${universityName}.` : ''}
The current user has the role: ${userRole}.

You help users navigate and understand the ERP system, answer questions about academic operations, 
fees, attendance, timetable, exams, hostel, library, transport, and placement.
Keep responses concise, friendly, and practical. Format lists with bullet points when helpful.
If asked about data you cannot access (like specific student records), explain politely that you can guide them to the right module.`.trim();
    }

    async chat(
        messages: ChatMessage[],
        userRole: string,
        universityName?: string,
    ): Promise<string> {
        if (!this.OPENROUTER_API_KEY) {
            throw new HttpException(
                'OPENROUTER_API_KEY is not configured on the server.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const payload = JSON.stringify({
            model: this.MODEL,
            messages: [
                { role: 'system', content: this.buildSystemPrompt(userRole, universityName) },
                ...messages,
            ],
            max_tokens: 800,
            temperature: 0.7,
        });

        return new Promise((resolve, reject) => {
            const url = new URL(this.API_URL);
            const options = {
                hostname: url.hostname,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'EduCore ERP System',
                    'Content-Length': Buffer.byteLength(payload),
                },
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.error) {
                            reject(
                                new HttpException(
                                    parsed.error.message || 'OpenRouter API error',
                                    HttpStatus.BAD_GATEWAY,
                                ),
                            );
                            return;
                        }
                        const content = parsed.choices?.[0]?.message?.content;
                        if (!content) {
                            reject(
                                new HttpException(
                                    'Empty response from AI model',
                                    HttpStatus.BAD_GATEWAY,
                                ),
                            );
                            return;
                        }
                        resolve(content.trim());
                    } catch (e) {
                        reject(
                            new HttpException(
                                'Failed to parse AI response',
                                HttpStatus.BAD_GATEWAY,
                            ),
                        );
                    }
                });
            });

            req.on('error', (err) => {
                reject(
                    new HttpException(
                        `Network error: ${err.message}`,
                        HttpStatus.BAD_GATEWAY,
                    ),
                );
            });

            req.write(payload);
            req.end();
        });
    }
}
