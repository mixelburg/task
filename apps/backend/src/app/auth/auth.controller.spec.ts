import { Test, TestingModule } from '@nestjs/testing'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { AuthHelper } from './auth.helper'
import { JwtStrategy } from './auth.strategy'
import { PrismaClient, User } from '@tasks/prisma/backend'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {FastifyReply} from "fastify";
import {RegisterDto} from "./register.dto";
import { v4 as uuidv4 } from 'uuid'

export const TEST_USER: User = {
  id: '63296909afb8d6cd4602347f',
  email: 'test@root.com',
  password: process.env['ADMIN_PASSWORD'] as string,
  name: 'test',
  createdAt: new Date(),
}


describe('AuthController', () => {
  let authController: AuthController
  const prisma = new PrismaClient()
  let authHelper: AuthHelper

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PassportModule.register({ session: false }),
        JwtModule.register({
          secret: 'secret',
        }),
      ],
      controllers: [AuthController],
      providers: [AuthService, AuthHelper, JwtStrategy],
    }).compile()

    authController = app.get<AuthController>(AuthController)
    authHelper = app.get<AuthHelper>(AuthHelper)
  }, 10_000)

  it('should not login with invalid password', async () => {
    const mockRes = {
      cookie: () => {},
      send: () => {},
    } as unknown as FastifyReply

    let err
    try {
      await authController.login({
        email: TEST_USER.email,
        password: 'invalid',
      }, mockRes)
    } catch (e) {
      err = e
    }

    expect(err).toBeDefined()
    expect(err.response.statusCode).toBe(401)
  })

  describe('register should work', () => {
    it('should register new user', async () => {
      const random = uuidv4()

      const user: RegisterDto = {
        email: `test-user-${random}@raccoons.com`,
        name: 'racoon',
        password: random,
      }
      const deleteIfExists = async () => {
        const exists = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        })
        if (exists) {
          await prisma.user.delete({
            where: {
              email: user.email,
            },
          })
        }
      }

      try {
        const res = await authController.signup(user)

        const exists = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        })

        expect(res).toBeDefined()
        expect(exists).toBeDefined()
        expect(authHelper.isPasswordValid(user.password, res.password)).toBeTruthy()
      } finally {
        await deleteIfExists()
      }
    }, 20_000)

    it('should not register duplicate user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test-register-duplicate@test.com',
          name: 'racoon',
          password: 'racoons-are-cool',
        },
      })

      try {
        let err
        try {
          await authController.signup({
            email: user.email,
            name: user.name,
            password: user.password,
          })
        } catch (e) {
          err = e
        }

        expect(err).toBeDefined()
        expect(err.response.statusCode).toBe(401)
      } finally {
        await prisma.user.delete({ where: { id: user.id } })
      }
    })
  })

  it('should get user details', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPass } = TEST_USER
    const res = await authController.getUserDetails(TEST_USER)

    expect(res.data).toEqual(userWithoutPass)
  })
})
