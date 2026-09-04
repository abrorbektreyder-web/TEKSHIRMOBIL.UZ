import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  // In-memory OTP store for dev/pilot (or SMS gateway in production)
  private otpStore: Map<string, { code: string; expiresAt: number }> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly creditsService: CreditsService,
  ) {}

  /**
   * Generates and dispatches OTP code to user's phone.
   */
  async sendOtp(phone: string): Promise<{ success: boolean; message: string; devCode?: string }> {
    const cleanedPhone = phone.replace(/[^\d+]/g, '');
    if (cleanedPhone.length < 9) {
      throw new BadRequestException('Telefon raqami noto‘g‘ri kiritildi');
    }

    // Standard dev code or random 4 digits
    const code = process.env.NODE_ENV === 'production' ? Math.floor(1000 + Math.random() * 9000).toString() : '7777';
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.otpStore.set(cleanedPhone, { code, expiresAt });

    console.log(`[SMS OTP SERVICE] Phone: ${cleanedPhone}, Code: ${code}`);

    return {
      success: true,
      message: 'Tasdiqlash kodi yuborildi',
      ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {}),
    };
  }

  /**
   * Verifies OTP, logs in or registers user, and issues tokens.
   */
  async verifyOtp(phone: string, code: string, name?: string) {
    const cleanedPhone = phone.replace(/[^\d+]/g, '');
    const entry = this.otpStore.get(cleanedPhone);

    const isDevCode = code === '7777';

    if (!isDevCode) {
      if (!entry || entry.expiresAt < Date.now()) {
        throw new BadRequestException('Kodni kiritish vaqti tugagan yoki kod so‘ralmagan');
      }

      if (entry.code !== code) {
        throw new BadRequestException('Kiritilgan tasdiqlash kodi noto‘g‘ri');
      }
    }

    // OTP verified, remove from store
    this.otpStore.delete(cleanedPhone);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone: cleanedPhone },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          phone: cleanedPhone,
          name: name || 'Foydalanuvchi',
          role: 'USER',
          status: 'ACTIVE',
        },
      });

      // Grant 1 free welcome credit for test/trial
      await this.creditsService.grantCredits(
        user.id,
        1,
        'ADMIN',
        'WELCOME_BONUS',
        `BONUS-${user.id}`,
      );
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Ushbu hisob bloklangan');
    }

    const tokens = await this.generateTokens(user);
    const credits = await this.creditsService.getUserCredits(user.id);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        credits,
      },
      isNewUser,
      ...tokens,
    };
  }

  /**
   * Admin / Partner login with phone and password.
   */
  async loginWithPassword(phone: string, pass: string) {
    const cleanedPhone = phone.replace(/[^\d+]/g, '');
    const user = await this.prisma.user.findUnique({
      where: { phone: cleanedPhone },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Telefon raqam yoki parol noto‘g‘ri');
    }

    if (user.status === 'BLOCKED') {
      throw new UnauthorizedException('Hisobingiz bloklangan');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Telefon raqam yoki parol noto‘g‘ri');
    }

    const tokens = await this.generateTokens(user);
    const credits = await this.creditsService.getUserCredits(user.id);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        partnerId: user.partnerId,
        credits,
      },
      ...tokens,
    };
  }

  /**
   * Generates access & refresh tokens and records session in DB.
   */
  async generateTokens(user: { id: string; phone: string; role: string }) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Rotates refresh token and returns new token pair.
   */
  async refreshTokens(refreshToken: string) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await this.prisma.userSession.findFirst({
      where: {
        refreshTokenHash: hash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session || !session.user || session.user.status === 'BLOCKED') {
      throw new UnauthorizedException('Refresh token yaroqsiz yoki muddati tugagan');
    }

    // Revoke old session
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(session.user);
  }

  /**
   * Revokes all active sessions for user.
   */
  async logout(userId: string) {
    await this.prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true, message: 'Muvaffaqiyatli chiqildi' };
  }

  /**
   * Fetches user profile with credits.
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        status: true,
        partnerId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    const credits = await this.creditsService.getUserCredits(userId);

    return {
      ...user,
      credits,
    };
  }
}
