import { IRefreshToken } from "../models/refresh-token.interface"



export interface IRefreshTokenRepository {
    save(token: IRefreshToken): Promise<void> 

    findByToken(token: string): Promise<IRefreshToken | null> 

    deleteByToken(token: string): Promise<void> 

    deleteByUserId(userId: string): Promise<void> 
}


