import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tekshir-jwt-secret-key-2026-very-secure',
    });
  }

  async validate(payload: { sub: string; phone: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status === 'BLOCKED') {
      throw new UnauthorizedException('Foydalanuvchi topilmadi yoki bloklangan');
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      status: user.status,
      partnerId: user.partnerId,
    };
  }
}
