
import { IRefreshToken } from "../../domain/models/refresh-token.interface";

import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";


export class RefreshTokenUseCase {
    constructor(private refreshTokenRepository: IRefreshTokenRepository) {}

    async createRefreshToken(tokenDataData: IRefreshToken): Promise<void> {
        return this.refreshTokenRepository.save(tokenDataData)
    }
    async findByToken(token: string): Promise<IRefreshToken | null> {
        return this.refreshTokenRepository.findByToken(token)
    }
    async deleteByToken(token: string): Promise<void> {
        return this.refreshTokenRepository.deleteByToken(token)
    }
}
