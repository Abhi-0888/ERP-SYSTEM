import { Controller, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AiService, ChatMessage } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

export class AiChatDto {
    messages: ChatMessage[];
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    @HttpCode(200)
    async chat(@Body() body: AiChatDto, @Request() req) {
        const { roles, universityName } = req.user;
        const activeRole = roles?.[0] ?? 'USER';
        const reply = await this.aiService.chat(body.messages, activeRole, universityName);
        return { reply };
    }
}
