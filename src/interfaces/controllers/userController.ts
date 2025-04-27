import { Request, Response } from "express"
import { UserUseCase } from "../../application/usecases/user.usecase"
import { HttpStatus } from "../../domain/models/http-status.enum"
import jwt from "jsonwebtoken"
import { ClassroomUseCase } from "../../application/usecases/classRoom.usecase"
import { RefreshTokenUseCase } from "../../application/usecases/refreshTokenUsecase"
import { ILoginResponse } from "../../domain/models/loginResponse.interface"

const generateToken = (id: string, subActive: boolean,type?:string) => {
    return jwt.sign(
        { id, sub_active: subActive, type:type },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    )
}
interface CustomJwtPayload extends jwt.JwtPayload {
    userId: string
    type: "signup" | "signin" // Adjust based on possible types
    email?: string
}

export class UserController {
    constructor(
        private userUseCase: UserUseCase,
        private classroomUseCase: ClassroomUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase
    ) {}

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const user = await this.userUseCase.createUser(req.body)

            const token = jwt.sign(
                { id: user.user._id, type: "signup", email: user.user.email },
                process.env.JWT_SECRET || "",
                { expiresIn: "1h" }
            )

            res.status(HttpStatus.OK).json({
                success: true,
                token,
                userId: user.user._id,
                classroomId: user.classroomId,
            })
        } catch (error: any) {
            console.error("Create user error:", error.message || error)
            const status =
                error.message === "Email already in use"
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR
            res.status(status).json({
                success: false,
                error: error.message || "Failed to create user",
            })
        }
    }

    async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body
            const users = await this.userUseCase.login(email, password)
            res.status(HttpStatus.OK).json({ success: true, data: users })
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message,
            })
        }
    }

    async updatePlan(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.split("Bearer ")[1] || ""

            if (!token) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Authorization token is required",
                })
                return
            }

            const { plan, billingCycle, userId } = req.body

            // Verify token
            let decoded: CustomJwtPayload
            try {
                decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET!
                ) as CustomJwtPayload
                console.log("the token is ", decoded)
            } catch (error) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Invalid or expired token",
                })
                return
            }

            // Check token type
            if (decoded.type !== "signup") {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    error: "Invalid token type",
                })
                return
            }

            // Validate userId
            if (!userId) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "User ID is required",
                })
                return
            }

            // Update plan
            const result = await this.userUseCase.updatePlan(
                plan,
                billingCycle,
                userId
            )

            res.status(HttpStatus.OK).json({
                success: true,
                data: result,
            })
        } catch (error: any) {
            console.error("Error updating plan:", error)
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || "Failed to update plan",
            })
        }
    }

    async authOAuth(req: Request, res: Response): Promise<void> {
        try {
            const { provider, providerId, email, name } = req.body

            const action = req.query.action as string // e.g., 'signup' or undefined

            if (!provider || !providerId || !email || !name) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Missing required fields",
                })
                return
            }

            let userData: any = { name, email }
            if (provider === "google") {
                userData.googleId = providerId
            } else if (provider === "azure-ad") {
                userData.microsoftId = providerId
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid provider",
                })
                return
            }

            // Check if user exists
            const userResult = await this.userUseCase.getUserByEmail(email)

            if (!userResult) {
                if (action === "signup") {
                    // Signup: Create new user and classroom
                    const createResult = await this.userUseCase.createUser(
                        userData
                    )
                    const newUser = createResult.user // Extract IUser from { user: IUser; classroomId: string }
                    const classroomId = createResult.classroomId

                    console.log(`Registered new user: ${email} via ${provider}`)

                    // Generate token for signup
                    const token = generateToken(
                        newUser._id,
                        newUser.subscription?.status === "active",
                        "signup"
                    )
                    const refreshToken = jwt.sign(
                        { id: newUser._id },
                        process.env.JWT_REFRESH_SECRET ||
                            process.env.JWT_SECRET ||
                            "",
                        { expiresIn: "7d" }
                    )
                    await this.refreshTokenUseCase.createRefreshToken({
                        userId: newUser._id.toString(),
                        token: refreshToken,
                        expiresAt: new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000
                        ),
                    })

                    res.status(HttpStatus.OK).json({
                        success: true,
                        data: {
                            user: {
                                _id: newUser._id,
                                email: newUser.email,
                                name: newUser.name,
                            },
                            classroomId: classroomId,
                            token,
                            tokenType: "signup",
                            refreshToken,
                        },
                    })
                    return
                } else {
                    // Login: User not found, return 401
                    res.status(HttpStatus.UNAUTHORIZED).json({
                        success: false,
                        message: "User not registered. Please sign up first.",
                    })
                    return
                }
            }

            // User exists, use userResult directly (IUser)
            const user = userResult

            // Link provider ID if not already linked
            if (provider === "google" && !user.googleId) {
                user.googleId = providerId
                await this.userUseCase.updateUser(user._id.toString(), {
                    googleId: providerId,
                })
            } else if (provider === "azure-ad" && !user.microsoftId) {
                user.microsoftId = providerId
                await this.userUseCase.updateUser(user._id.toString(), {
                    microsoftId: providerId,
                })
            }

            // Check subscription status
            let token: string
            let classroomId = ""
            if (!user.subscription?.stripeCustomerId) {
                token = generateToken(
                    user._id,
                    user.subscription?.status === "active"
                )
                const classroom = await this.classroomUseCase.findByTeacherId(
                    user._id.toString()
                )
                classroomId = classroom?.id || ""
            } else {
                if (
                    !["trialing", "active"].includes(
                        user.subscription.status || ""
                    )
                ) {
                    res.status(HttpStatus.FORBIDDEN).json({
                        success: false,
                        message:
                            "Your subscription is not active. Please contact support.",
                    })
                    return
                }

                token = jwt.sign(
                    { id: user._id, sub_active: true },
                    process.env.JWT_SECRET as string,
                    { expiresIn: "1h" }
                )
                const classroom = await this.classroomUseCase.findByTeacherId(
                    user._id.toString()
                )
                classroomId = classroom?.id || ""
            }
            const refreshToken = jwt.sign(
                { id: user._id },
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "",
                { expiresIn: "7d" }
            )

            await this.refreshTokenUseCase.createRefreshToken({
                userId: user._id.toString(),
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            })

            res.status(HttpStatus.OK).json({
                success: true,
                data: {
                    user: {
                        _id: user._id,
                        email: user.email,
                        name: user.name,
                    },
                    classroomId,
                    token,
                    refreshToken,
                },
            })
        } catch (error: any) {
            console.error("OAuth error:", error.message)
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || "Failed to process OAuth",
            })
        }
    }
    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body

            if (!refreshToken) {
                res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Refresh token is required",
                })
                return
            }

            // Verify refresh token
            let payload: any
            try {
                payload = jwt.verify(
                    refreshToken,
                    process.env.JWT_REFRESH_SECRET ||
                        process.env.JWT_SECRET ||
                        ""
                )
            } catch (error) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Invalid or expired refresh token",
                })
                return
            }

            // Check if refresh token exists in database
            const storedToken = await this.refreshTokenUseCase.findByToken(
                refreshToken
            )
            if (!storedToken || storedToken.expiresAt < new Date()) {
                res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: "Invalid or expired refresh token",
                })
                return
            }

            // Get user
            const user = await this.userUseCase.getUserById(payload.id)
            if (!user) {
                res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: "User not found",
                })
                return
            }

            // Generate new access token
            const status = user.subscription?.status === "active"
            const accessToken = jwt.sign(
                { id: user._id, sub_active: status },
                process.env.JWT_SECRET || "",
                { expiresIn: "1h" }
            )

            // Optionally, generate a new refresh token
            const newRefreshToken = jwt.sign(
                { id: user._id },
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "",
                { expiresIn: "7d" }
            )

            // Update refresh token in database
            await this.refreshTokenUseCase.deleteByToken(refreshToken)
            await this.refreshTokenUseCase.createRefreshToken({
                userId: user._id.toString(),
                token: newRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            })

            // Get classroom
            const classRoom = await this.classroomUseCase.findByTeacherId(
                user._id
            )

            const response: ILoginResponse = {
                token: accessToken,
                refreshToken: newRefreshToken,
                message: "Token refreshed successfully",
                expiresIn: 3600,
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
                classroomId: classRoom?.id,
            }

            res.status(HttpStatus.OK).json({
                success: true,
                data: response,
            })
        } catch (error: any) {
            console.error("Refresh token error:", error.message)
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || "Failed to refresh token",
            })
        }
    }
}



