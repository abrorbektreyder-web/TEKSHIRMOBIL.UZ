import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivePackages() {
    return this.prisma.package.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAllPackages() {
    return this.prisma.package.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPackageById(id: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id },
    });
    if (!pkg) {
      throw new NotFoundException('Paket topilmadi');
    }
    return pkg;
  }

  async createPackage(data: {
    name: string;
    credits: number;
    price: number;
    description?: string;
    sortOrder?: number;
  }) {
    return this.prisma.package.create({
      data: {
        name: data.name,
        credits: data.credits,
        price: data.price,
        description: data.description,
        sortOrder: data.sortOrder ?? 0,
        status: 'ACTIVE',
      },
    });
  }

  async updatePackage(id: string, data: Partial<{
    name: string;
    credits: number;
    price: number;
    description: string;
    status: string;
    sortOrder: number;
  }>) {
    return this.prisma.package.update({
      where: { id },
      data,
    });
  }
}
