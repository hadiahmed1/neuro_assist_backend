import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config";
import { randomBytes, randomUUID } from "crypto";
import { Env } from "../../config/env.schema.js";
import { Role } from "../../generated/prisma/enums.js";
import { sha256 } from "../../common/utils/hash.js";
import { addDays } from "../../common/utils/date.js";

@Injectable()
export class TokenService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService<Env, true>
    ) { }

    async issueToken(
        user: { id: string; role: Role },
        opts: { familyId?: string; ip?: string; userAgent?: string } = {},
    ): Promise<{ access: string; refresh: string }> {
        const secret = randomBytes(32).toString('hex');
        const refreshDays = this.config.get('REFRESH_TTL_DAYS', { infer: true });

        const session = await this.prisma.session.create({
            data: {
                userId: user.id,
                familyId: opts.familyId ?? randomUUID(),
                tokenHash: sha256(secret),
                expiresAt: addDays(new Date(), refreshDays),
                ip: opts.ip,
                userAgent: opts.userAgent,
            },
        });

        const access = await this.jwt.signAsync({
            sub: user.id,
            role: user.role,
            jti: randomUUID(),
        });

        return { access, refresh: `${session.id}.${secret}` };
    }
}
