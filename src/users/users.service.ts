import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { toFrontendRole, toBackendRole } from '../common/utils/role-mapper';

const SALT_ROUNDS = 12;

const USER_SELECT = {
  id: true,
  organizationId: true,
  name: true,
  email: true,
  avatar: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: {
        uq_users_org_email: {
          organizationId: dto.organizationId,
          email: dto.email,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Email já cadastrado nesta organização');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const backendRole = toBackendRole(dto.role as string);

    const created = await this.prisma.user.create({
      data: {
        organizationId: dto.organizationId,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: backendRole,
        avatar: dto.avatar,
      },
      select: USER_SELECT,
    });

    return {
      ...created,
      fullName: created.name,
      role: toFrontendRole(created.role),
    };
  }

  async findAllByOrganization(
    organizationId: string,
    page = 1,
    pageSize = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { organizationId },
        select: USER_SELECT,
        orderBy: { name: 'asc' },
        skip,
        take: pageSize,
      }),
      this.prisma.user.count({ where: { organizationId } }),
    ]);
    const mapped = data.map((u) => ({ ...u, fullName: u.name, role: toFrontendRole(u.role) }));
    return { data: mapped, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      select: USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return { ...user, fullName: user.name, role: toFrontendRole(user.role) };
  }

  async update(id: string, organizationId: string, dto: UpdateUserDto) {
    await this.findOne(id, organizationId);
    const data: any = { ...dto };
    if (dto.role) {
      data.role = toBackendRole(dto.role as string);
    }

    const updated = await this.prisma.user.update({ where: { id }, data, select: USER_SELECT });
    return { ...updated, fullName: updated.name, role: toFrontendRole(updated.role) };
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    await this.prisma.user.delete({ where: { id } });
  }
}
