import { User } from '@tasks/prisma/backend'


export type RegisterDto = Omit<User, 'id' | 'createdAt'>

