import bcrypt from "bcrypt" // for password hashing
import jwt from "jsonwebtoken" // for JWT token generation
import { IUserRepository } from "../../domain/repositories/userRepository.interface"
import { IUser } from "../../domain/models/user.interface"
import { ILoginResponse, IUpdatePlanResponse } from "../../domain/models/loginResponse.interface"

import { IClassroomRepository } from "../../domain/repositories/classroomRepository"

export class UserUseCase {
    constructor(
        private userRepository: IUserRepository,
        private classroomRepository: IClassroomRepository
    ) {}

   
    async createUser(
        userData: Partial<IUser>
    ): Promise<{ user: IUser; classroomId: string }> {
        // Validate required fields
        if (!userData.name || !userData.email) {
            throw new Error("Name and email are required")
        }

        // Require password for non-OAuth users
        if (!userData.googleId && !userData.microsoftId) {
            if (!userData.password) {
                throw new Error("Password is required for non-OAuth users")
            }
            if (userData.password.length < 8) {
                throw new Error("Password must be at least 8 characters")
            }
            // Hash password
            userData.password = await bcrypt.hash(userData.password, 10)
        } else {
            // Ensure no password is set for OAuth users
            userData.password = undefined
        }

        // Check if user exists
        const existingUser = await this.userRepository.findByEmail(
            userData.email
        )
        if (existingUser) {
            throw new Error("Email already in use")
        }

        // Create user
        const user = await this.userRepository.create(userData)

        

        // Create classroom
        const classroom = await this.classroomRepository.createClassRoom(
            user._id!.toString()
        )

        if (!classroom.id) {
            throw new Error("Failed to create ClassRoom: No _id assigned")
        }
        return { user, classroomId: classroom.id }
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return this.userRepository.findByEmail(email)
    }

    async login(email: string, password: string): Promise<ILoginResponse> {
        // Find user by email
        const user = await this.userRepository.login(email, password)

        // If user doesn't exist, throw an error
        if (!user) {
            throw new Error("User is not registered")
        }

        // Compare the password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password)

        // If password doesn't match, throw an error
        if (!isMatch) {
            throw new Error("Invalid credentials")
        }

        // Generate JWT token
        const status = user.subscription?.status === "active"
        const classRoom = await this.classroomRepository.findByTeacherId(user._id)
        const token = jwt.sign(
            { id: user._id, sub_active: status },
            process.env.JWT_SECRET || "", 
            { expiresIn: "1h" } 
        )

        // Construct the ILoginResponse object
        const loginResponse: ILoginResponse = {
            token: token,
            message: "Login successful",
            expiresIn: 3600, 
            userId: user._id.toString(), 
            email: user.email,
            name: user.name,
            classroomId:classRoom?.id,
        }

        // Return the login response
        return loginResponse
    }

    async updatePlan(
        plan: string,
        billingCycle: string,
        userId: string
    ): Promise<IUpdatePlanResponse> {
        try {
            // Validate inputs
            const validPlans = ["educator", "department", "institution"]
            const validBillingCycles = ["monthly", "yearly"]
            if (!validPlans.includes(plan)) {
                throw new Error("Invalid plan")
            }
            if (!validBillingCycles.includes(billingCycle)) {
                throw new Error("Invalid billing cycle")
            }

            // Update user in repository
            const user = await this.userRepository.updatePlan(
                plan,
                billingCycle,
                userId
            )
            return { success: true, user }
        } catch (error: any) {
            throw new Error(error.message || "Failed to update plan")
        }
    }
    async updateUser(
        userId: string,
        updateData: Partial<IUser>
    ): Promise<IUser> {
        // If updating email, check for uniqueness
        if (updateData.email) {
            const existingUser = await this.userRepository.findByEmail(
                updateData.email
            )
            if (existingUser && existingUser._id!.toString() !== userId) {
                throw new Error("Email is already in use")
            }
        }

        // Remove fields that should not be updated
        const allowedUpdates: Partial<IUser> = { ...updateData }
        delete allowedUpdates._id // Prevent updating _id
        delete allowedUpdates.createdAt // Prevent updating createdAt
        delete allowedUpdates.updatedAt // Prevent updating updatedAt
        if (allowedUpdates.password) {
            throw new Error("Password updates are not allowed via this method")
        }

        // Update user in repository
        const updatedUser = await this.userRepository.update(
            userId,
            allowedUpdates
        )
        if (!updatedUser) {
            throw new Error("User not found")
        }

        return updatedUser
    }
}
