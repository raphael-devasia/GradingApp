import { IUser } from "../models/user.interface"

export interface IUserRepository {
    create(user: Partial<IUser>): Promise<IUser>

    findByEmail(email: string): Promise<IUser | null>
    findByUserId(userId: string): Promise<IUser | null>
    

    login(email: string, password: string): Promise<IUser | null>
    update(userId: string, updateData: Partial<IUser>): Promise<IUser | null>

    updatePlan(
        plan: string,
        billingCycle: string,
        userId: string
    ): Promise<IUser>
}
