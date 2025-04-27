import mongoose, { Schema, Document } from "mongoose"
import { IRefreshToken } from "../../domain/models/refresh-token.interface"

interface IRefreshTokenDocument extends IRefreshToken, Document {}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>({
    userId: { type: String, required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
})

const RefreshTokenModel = mongoose.model<IRefreshTokenDocument>(
    "RefreshToken",
    RefreshTokenSchema
)

export class RefreshTokenRepository {
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
