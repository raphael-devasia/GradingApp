import { ClassroomUseCase } from "../../application/usecases/classRoom.usecase"
import { RefreshTokenUseCase } from "../../application/usecases/refreshTokenUsecase"
import { UserUseCase } from "../../application/usecases/user.usecase"
import { UserController } from "../../interfaces/controllers/userController"
import { ClassroomRepositoryMongo } from "../repositories/ClassroomRepositoryMongo"
import { RefreshTokenRepository } from "../repositories/refreshTokenRepositoryMongo"
import { UserRepositoryMongo } from "../repositories/userRepositoryMongo"

export const createUserController = (): UserController => {
    const userRepository = new UserRepositoryMongo()
    const classRoomRepository = new ClassroomRepositoryMongo()
    const refreshTokenRepository = new RefreshTokenRepository()

    const userUseCase = new UserUseCase(
        userRepository,
        classRoomRepository,
        refreshTokenRepository
    )
    const classroomUseCase = new ClassroomUseCase(classRoomRepository)
    const refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepository)

    return new UserController(
        userUseCase,
        classroomUseCase,
        refreshTokenUseCase
    )
}
