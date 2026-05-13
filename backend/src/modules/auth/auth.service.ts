import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, pass: string, username?: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (username) {
      const existingUsername = await this.prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(pass, salt);

    const user = await this.prisma.user.create({
      data: {
        email,
        username: username || null,
        password_hash,
      },
    });

    return this.generateToken(user);
  }

  async login(identifier: string, pass: string) {
    // Try to find user by email first, then by username
    let user = await this.prisma.user.findUnique({ where: { email: identifier } });
    if (!user) {
      user = await this.prisma.user.findUnique({ where: { username: identifier } });
    }
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Streak calculation
    const now = new Date();
    const lastLogin = new Date(user.lastLogin);
    const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let newStreak = user.streak_count;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: now,
        streak_count: newStreak
      }
    });

    return this.generateToken(user);
  }

  private generateToken(user: { id: string; email: string; username: string | null; role: string; is_unlimited: boolean }) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      is_unlimited: user.is_unlimited,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        is_unlimited: user.is_unlimited,
      },
    };
  }
}
