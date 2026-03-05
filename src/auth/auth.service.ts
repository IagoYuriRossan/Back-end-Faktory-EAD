import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RefreshTokenDto } from './dto';
import { JwtPayload, RefreshPayload } from './interfaces';
import { toFrontendRole, toBackendRole } from '../common/utils/role-mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private buildTokens(user: {
    id: string;
    organizationId: string;
    role: any;
    email: string;
    name: string;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      userId: user.id,
      organizationId: user.organizationId ?? null,
      role: toFrontendRole(user.role),
      email: user.email,
      name: user.name,
    };

    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'refresh_secret_change_me',
    );

    const token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' } as RefreshPayload,
      {
        secret: refreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      },
    );

    return { token, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: dto.email, mode: 'insensitive' },
        isActive: true,
      },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.organization.status !== 'ACTIVE') {
      throw new UnauthorizedException('Organização inativa ou suspensa');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { token, refreshToken } = this.buildTokens(user);

    return {
      access_token: token,
      token,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.name,
        name: user.name,
        email: user.email,
        role: toFrontendRole(user.role),
        organizationId: user.organizationId,
        avatar: user.avatar,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
        },
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'refresh_secret_change_me',
    );

    let payload: RefreshPayload;
    try {
      payload = this.jwtService.verify<RefreshPayload>(dto.refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, isActive: true },
      include: { organization: true },
    });

    if (!user || user.organization.status !== 'ACTIVE') {
      throw new UnauthorizedException('Usuário inativo');
    }

    const { token, refreshToken } = this.buildTokens(user);

    return {
      access_token: token,
      token,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.name,
        name: user.name,
        email: user.email,
        role: toFrontendRole(user.role),
        organizationId: user.organizationId,
        avatar: user.avatar,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { passwordHash: _, ...rest } = user;
    return {
      ...rest,
      fullName: rest.name,
      role: toFrontendRole(rest.role),
    };
  }
}
