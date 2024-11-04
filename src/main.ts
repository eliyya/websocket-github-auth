import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { readFile } from 'fs/promises'

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        httpsOptions:
            process.env.NODE_ENV !== 'production' ?
                undefined
            :   {
                    key: await readFile('./selfsigned.key'),
                    cert: await readFile('./selfsigned.crt'),
                },
    })
    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
