// src/token/token.controller.ts
import { Controller, Get, Headers, HttpStatus, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller('token')
export class AuthController {
    @Get('validate')
    async validateToken(
        @Headers('authorization') authHeader: string,
        @Res() res: Response,
    ) {
        // Aquí puedes hacer la validación del token si es necesario
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            // Realiza la lógica para validar el token aquí
            console.log('Token recibido:', token)
            try {
                const response = await fetch('https://api.github.com/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (!response.ok) throw new Error('Authentication failed')
                const userData = await response.json()
                return res.status(HttpStatus.OK).json(userData) // Devuelve 200 OK
            } catch (error) {
                console.error('Authentication error:', error)
                return res
                    .status(HttpStatus.UNAUTHORIZED)
                    .json({ message: 'Invalid token' })
            }
        }
        return res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ message: 'No token provided' })
    }
}
