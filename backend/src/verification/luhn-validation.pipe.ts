import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isValidImei, cleanImei } from '@tekshir/shared';

@Injectable()
export class LuhnValidationPipe implements PipeTransform {
  transform(value: any) {
    let imei = '';

    if (typeof value === 'string') {
      imei = value;
    } else if (value && typeof value === 'object' && typeof value.imei === 'string') {
      imei = value.imei;
    }

    const cleaned = cleanImei(imei);

    if (cleaned.length !== 15) {
      throw new BadRequestException('IMEI raqami 15 xonali raqamdan iborat bo‘lishi kerak');
    }

    if (!isValidImei(cleaned)) {
      throw new BadRequestException('IMEI formati yoki nazorat raqami noto‘g‘ri (Luhn tekshiruvidan o‘tmadi)');
    }

    return value;
  }
}
