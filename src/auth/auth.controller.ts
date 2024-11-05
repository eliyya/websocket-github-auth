// src/token/token.controller.ts
import {
    Body,
    Controller,
    Headers,
    HttpStatus,
    Post,
    Res,
} from '@nestjs/common'
import { Response } from 'express'

@Controller('token')
export class AuthController {
    @Post('validate')
    async validateToken(@Body('code') code: string, @Res() res: Response) {
        // Aquí puedes hacer la validación del token si es necesario
        if (code) {
            try {
                const tokenData = await fetch(
                    'https://github.com/login/oauth/access_token',
                    {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
                            client_secret: process.env.GITHUB_CLIENT_SECRET,
                            code,
                        }),
                    },
                ).then(r => r.json())

                if (!tokenData.access_token) {
                    console.log('No TOKEN', tokenData)
                    return res.status(HttpStatus.OK).json(tokenData)
                } else
                    return res
                        .status(HttpStatus.UNAUTHORIZED)
                        .json({ message: 'Invalid code' })
            } catch (error) {
                console.error('Authentication error:', error)
                return res
                    .status(HttpStatus.UNAUTHORIZED)
                    .json({ message: 'Invalid code' })
            }
        }
        return res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ message: 'No code provided' })
    }
}
