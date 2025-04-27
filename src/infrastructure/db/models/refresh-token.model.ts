import mongoose, { Schema } from "mongoose"
import { IRefreshToken } from "../../../domain/models/refresh-token.interface"

const RefreshTokenSchema = new Schema<IRefreshToken>({
    userId: { type: String, required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
})


export default mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema)


