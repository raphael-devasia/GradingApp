import mongoose, { Types } from "mongoose"
import { IClassroomRepository } from "../../domain/repositories/classroomRepository"
import { IClassroom } from "../../domain/models/classroom.model"
import { IStudent } from "../../domain/models/students.model"
import { ICoTeacher } from "../../domain/models/co-teacher.model"
import ClassroomModel from "../db/models/classRoom.model"
import StudentModel from "../db/models/students.model"
import CoTeacherModel from "../db/models/co-teachers.model"

export class ClassroomRepositoryMongo implements IClassroomRepository {
    async createClassRoom(teacherId: string): Promise<IClassroom> {
        try {
            const classroom = new ClassroomModel({
                teacherId: new Types.ObjectId(teacherId),
                coTeacherIds: [],
                studentIds: [],
            })
            const savedClassroom = await classroom.save()
            return savedClassroom.toJSON() as IClassroom
        } catch (error: any) {
            throw new Error(`Failed to create classroom: ${error.message}`)
        }
    }

    async findClassrooms(teacherId: string): Promise<IClassroom[] | null> {
        try {
            if (!mongoose.Types.ObjectId.isValid(teacherId)) {
                throw new Error("Invalid teacher ID format")
            }
            const classrooms = await ClassroomModel.find({
                $or: [{ teacherId }, { coTeacherIds: teacherId }],
            }).exec()
            return classrooms.map(
                (classroom) => classroom.toJSON() as IClassroom
            )
        } catch (error: any) {
            throw new Error(`Failed to fetch classrooms: ${error.message}`)
        }
    }

    async addStudent(
        classroomId: string,
        student: Partial<IStudent>
    ): Promise<IStudent> {
        try {
            if (!mongoose.Types.ObjectId.isValid(classroomId)) {
                throw new Error("Invalid classroom ID format")
            }
            let studentDoc = await StudentModel.findOne({
                email: student.email,
            })
            if (!studentDoc) {
                studentDoc = new StudentModel({
                    ...student,
                    classes: student.classes || ["all"],
                })
                await studentDoc.save()
            }
            const classroom = await ClassroomModel.findById(classroomId)
            if (!classroom) {
                throw new Error("Classroom not found")
            }
            const studentIdStr = studentDoc._id.toString()
            if (!classroom.studentIds.includes(studentIdStr)) {
                classroom.studentIds.push(studentIdStr)
                await classroom.save()
            }
            return studentDoc.toJSON() as IStudent
        } catch (error: any) {
           
            throw new Error(`Failed to add student: ${error.message}`)
        }
    }

    async addCoTeacher(
        classroomId: string,
        coTeacher: Partial<ICoTeacher>
    ): Promise<ICoTeacher> {
        try {
            if (!mongoose.Types.ObjectId.isValid(classroomId)) {
                throw new Error("Invalid classroom ID format")
            }
            let coTeacherDoc = await CoTeacherModel.findOne({
                email: coTeacher.email,
            })
            if (!coTeacherDoc) {
                coTeacherDoc = new CoTeacherModel({
                    ...coTeacher,
                    classes: coTeacher.classes || ["all"],
                    status: coTeacher.status || "pending",
                })
                await coTeacherDoc.save()
            }
            const classroom = await ClassroomModel.findById(classroomId)
            if (!classroom) {
                throw new Error("Classroom not found")
            }
            const coTeacherIdStr = coTeacherDoc._id.toString()
            if (!classroom.coTeacherIds.includes(coTeacherIdStr)) {
                classroom.coTeacherIds.push(coTeacherIdStr)
                await classroom.save()
            }
            return coTeacherDoc.toJSON() as ICoTeacher
        } catch (error: any) {
            
            throw new Error(`Failed to add co-teacher: ${error.message}`)
        }
    }

    async getStudents(classroomId: string): Promise<IStudent[]> {
        try {
            if (!mongoose.Types.ObjectId.isValid(classroomId)) {
                throw new Error("Invalid classroom ID format")
            }
            const classroom = await ClassroomModel.findById(classroomId)
                .populate(
                    "studentIds",
                    "name email classes assignments createdAt updatedAt"
                )
                .exec()
            if (!classroom) {
                throw new Error("Classroom not found")
            }
            return (classroom.studentIds as any[]).map(
                (student) => student.toJSON() as IStudent
            )
        } catch (error: any) {
            throw new Error(`Failed to fetch students: ${error.message}`)
        }
    }

    async getCoTeachers(classroomId: string): Promise<ICoTeacher[]> {
        try {
            if (!mongoose.Types.ObjectId.isValid(classroomId)) {
                throw new Error("Invalid classroom ID format")
            }
            const classroom = await ClassroomModel.findById(classroomId)
                .populate(
                    "coTeacherIds",
                    "name email classes status createdAt updatedAt"
                )
                .exec()
            if (!classroom) {
                throw new Error("Classroom not found")
            }
            return (classroom.coTeacherIds as any[]).map(
                (coTeacher) => coTeacher.toJSON() as ICoTeacher
            )
        } catch (error: any) {
            throw new Error(`Failed to fetch co-teachers: ${error.message}`)
        }
    }

    async findByTeacherId(teacherId: string): Promise<IClassroom | null> {
        try {
            if (!Types.ObjectId.isValid(teacherId)) {
                throw new Error("Invalid teacherId")
            }
            const classroom = await ClassroomModel.findOne({
                teacherId: new Types.ObjectId(teacherId),
            })
            if (!classroom) return null
            return {
                id: classroom.id,
                teacherId: classroom.teacherId.toString(),
                coTeacherIds: classroom.coTeacherIds.map((id) => id.toString()),
                studentIds: classroom.studentIds.map((id) => id.toString()),
                createdAt: classroom.createdAt,
                updatedAt: classroom.updatedAt,
            }
        } catch (error: any) {
            throw new Error(`Failed to find classroom: ${error.message}`)
        }
    }
}
