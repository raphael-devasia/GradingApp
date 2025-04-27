
import { IRefreshToken } from "../../domain/models/refresh-token.interface"
import { IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository"
import RefreshTokenModel from "../db/models/refresh-token.model"

export class RefreshTokenRepository implements IRefreshTokenRepository {
    async save(token: IRefreshToken): Promise<void> {
        await RefreshTokenModel.create(token)
    }

    async findByToken(token: string): Promise<IRefreshToken | null> {
        return RefreshTokenModel.findOne({ token }).exec()
    }

    async deleteByToken(token: string): Promise<void> {
        await RefreshTokenModel.deleteOne({ token }).exec()
    }

    async deleteByUserId(userId: string): Promise<void> {
        await RefreshTokenModel.deleteMany({ userId }).exec()
    }
}
