import {ExecutionContext, Module} from '@nestjs/common'

import {AppController} from './app.controller'
import {AppService} from './app.service'
import {ConfigModule} from '@nestjs/config'
import logger from './logger'
import {APP_FILTER, APP_INTERCEPTOR} from '@nestjs/core'
import {createFastifyHttpExceptionFilter, createLoggingInterceptor, ShouldMute} from '@tasks/util'
import {NotificationsModule} from "./services/notifications/notifications.module";

const shouldMute: ShouldMute = (context: ExecutionContext) => {
    return context.getHandler().name === 'health'
}


@Module({
    imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        NotificationsModule
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: createLoggingInterceptor(logger, shouldMute),
        },
        {
            provide: APP_FILTER,
            useClass: createFastifyHttpExceptionFilter(logger),
        },
        AppService,
    ],
})
export class AppModule {
}
