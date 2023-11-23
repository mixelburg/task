import { Prisma, User } from '@tasks/prisma/backend'

export const userSelector = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
    createdAt: true,
  },
})

export type UserWithoutPassword = Omit<User, 'password'> & { password?: never }

export type UserDetails = {
  data: UserWithoutPassword,
}

export type ILoginData = {
  email: string;
  password: string;
}
