import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  constructor(private readonly prisma: PrismaService) {}

  async sendMessage(text: string): Promise<boolean> {
    if (!this.botToken || this.botToken === 'mock_or_real_bot_token' || !this.adminChatId) {
      this.logger.log(`[TELEGRAM SIMULATION] Message:\n${text}`);
      return true;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.adminChatId,
          text,
          parse_mode: 'HTML',
        }),
      });
      return res.ok;
    } catch (e: any) {
      this.logger.error(`Failed to send Telegram message: ${e.message}`);
      return false;
    }
  }

  async sendDailyReport(): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayUsers, todayVerifications, clearCount, activeCount, todayRevenue, packagesSold] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'USER', createdAt: { gte: today } } }),
        this.prisma.verificationRequest.count({ where: { createdAt: { gte: today } } }),
        this.prisma.verificationRequest.count({ where: { status: 'CLEAR', createdAt: { gte: today } } }),
        this.prisma.verificationRequest.count({ where: { status: 'ACTIVE_INSTALLMENT', createdAt: { gte: today } } }),
        this.prisma.payment.aggregate({
          where: { status: 'PAID', createdAt: { gte: today } },
          _sum: { amount: true },
        }),
        this.prisma.payment.count({ where: { status: 'PAID', createdAt: { gte: today } } }),
      ]);

    const formattedDate = new Date().toLocaleDateString('uz-UZ');
    const revenueSum = (todayRevenue._sum.amount || 0).toLocaleString('uz-UZ');

    const message = `📊 <b>KUNLIK HISOBOT</b>
Sana: ${formattedDate}
👤 Yangi foydalanuvchilar: ${todayUsers}
📱 IMEI tekshiruvlari: ${todayVerifications}
🟢 CLEAR: ${clearCount}
🔴 ACTIVE: ${activeCount}
💰 Tushum: ${revenueSum} so‘m
💳 Sotilgan paketlar: ${packagesSold}
API status: ✅ Faol`;

    await this.sendMessage(message);
    return message;
  }

  async sendAlert(level: 'WARN' | 'CRITICAL', title: string, details: string) {
    const icon = level === 'CRITICAL' ? '🚨' : '⚠️';
    const message = `${icon} <b>TIZIM OGOHLANTIRISHI [${level}]</b>
<b>Mavzu:</b> ${title}
<b>Vaqt:</b> ${new Date().toISOString()}
<b>Tafsilot:</b>
<code>${details}</code>`;

    await this.sendMessage(message);
  }
}
