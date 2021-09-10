import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import * as Joi from 'joi';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { User } from './users/entities/user.entity';
import { Verification } from './users/entities/verification.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Config Setting
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'test'
          ? '.env.test'
          : process.env.NODE_ENV === 'dev'
          ? '.env.dev'
          : '.env.prod',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        SECRET_KEY: Joi.string().required(),
      }),
    }),
    // Graphql Setting
    GraphQLModule.forRoot({ autoSchemaFile: true, context: ({ req }) => ({ user: req['user'] }) }),
    // TypeOrm Setting
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }),
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'test',
      entities: [User, Verification],
    }),
    // JWT Module Setting
    JwtModule.forRoot(),
    // Auth
    AuthModule,
    // Resolvers
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
