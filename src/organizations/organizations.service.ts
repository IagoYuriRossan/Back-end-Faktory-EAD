import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({
      where: { cnpj: dto.cnpj },
    });
    if (existing) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name,
        cnpj: dto.cnpj,
        domain: dto.domain,
        logo: dto.logo,
        licensesTotal: dto.licensesTotal ?? 0,
      },
    });
  }

  async findAll(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.organization.count(),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organização não encontrada');
    }
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data: dto,
    });
  }
}
