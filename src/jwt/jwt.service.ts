import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(private readonly config: ConfigService) {}

  sign(id: number): string {
    return jwt.sign({ id }, this.config.get('SECRET_KEY'));
  }
}
