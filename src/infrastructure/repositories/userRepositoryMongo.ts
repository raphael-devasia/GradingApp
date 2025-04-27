import { Types } from "mongoose"
import { IUser } from "../../domain/models/user.interface"
import { IUserRepository } from "../../domain/repositories/userRepository.interface"
import User from "../db/models/user.model"

export class UserRepositoryMongo implements IUserRepository {
    async create(user: IUser): Promise<IUser> {
        try {
            console.log("Creating user:", user)

            // If no user is found, proceed with creating a new user
            const newUser = new User(user)
            console.log("New user:", newUser)

            return await newUser.save()
        } catch (error: any) {
            console.error("Error saving user:", error.message || error)
            throw new Error(error.message || "Error saving user")
        }
    }
    async findByEmail(email: string): Promise<IUser | null> {
        try {
            // Search for a user with the provided email
            const existingUser = await User.findOne({ email })
            return existingUser
        } catch (error) {
            console.error("Error finding user by email:", error)
            throw new Error("Error finding user")
        }
    }
    async findByUserId(userId: string): Promise<IUser | null> {
        try {
            // Search for a user with the provided userId
            const existingUser = await User.findById(userId)
            return existingUser
        } catch (error) {
            console.error("Error finding user by userId:", error)
            throw new Error("Error finding user")
        }
    }

    
    async update(
        userId: string,
        updateData: Partial<IUser>
    ): Promise<IUser | null> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new Error("Invalid user ID")
            }
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).lean()
            return updatedUser
        } catch (error: any) {
            throw new Error(`Failed to update user: ${error.message}`)
        }
    }

    async login(email: string, password: string): Promise<IUser | null> {
        try {
            // Find user by email
            const user = await User.findOne({ email })

            // If user doesn't exist, throw an error
            if (!user) {
                throw new Error("Invalid credentials")
            }
            console.log("User found:", user)
            console.log(password)

            // Return the user if authentication is successful
            return user
        } catch (error) {
            console.error("Error fetching user by email:", error)
            throw new Error("User is not registered")
        }
    }
    async updatePlan(
        plan: string,
        billingCycle: string,
        userId: string,
        stripeCustomerId?: string,
        stripeSubscriptionId?: string
    ): Promise<IUser> {
        try {
            const user = await User.findById(userId)
            if (!user) {
                throw new Error("User not found")
            }

            // Initialize subscription if undefined
            if (!user.subscription) {
                user.subscription = {
                    plan: "",
                    billingCycle: "",
                    stripeCustomerId: "",
                    stripeSubscriptionId: "",
                    status: "inactive",
                }
            }

            // Update subscription fields
            user.subscription = {
                plan,
                billingCycle,
                stripeCustomerId:
                    stripeCustomerId || user.subscription.stripeCustomerId,
                stripeSubscriptionId:
                    stripeSubscriptionId ||
                    user.subscription.stripeSubscriptionId,
                status: "active", // Set to active on successful payment
            }

            const updatedUser = await user.save()
            console.log("Updated user subscription:", {
                userId,
                plan,
                billingCycle,
                status: updatedUser.subscription.status,
            })
            return updatedUser
        } catch (error: any) {
            console.error("Error updating user plan:", error.message || error)
            throw new Error(error.message || "Error updating user plan")
        }
    }
}
