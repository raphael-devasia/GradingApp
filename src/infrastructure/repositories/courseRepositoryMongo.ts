
import * as dotenv from "dotenv"
dotenv.config()




import { ICourse } from "../../domain/models/course.interface"
import Course from "../db/models/course.model"
import { ICourseRepository } from "../../domain/repositories/courseRepository"



export class CourseRepositoryMongo implements ICourseRepository {
    async create(course: ICourse): Promise<ICourse> {
        try {
            const result = await Course.create(course)

            return result
        } catch (error) {
            throw new Error("Failed to save the course")
        }
    }
    async getAllUserCourses(userId: string): Promise<ICourse[]> {
        try {
           
            
            // Fetch courses filtered by userId
            const courses = await Course.find({ userId: userId })
                
            
            return courses
        } catch (error: any) {
            
            throw new Error("Failed to fetch courses. Please try again later.") 
        }
    }
    async findById(courseId: string): Promise<ICourse | null> {
        try {
            
            const course = await Course.findById(courseId)
            if (!course) {
               
                return null // If the course is not found, return null
            }

            // Save the updated course back to the database
            await course.save()
            return course
        } catch (error) {
            console.error("Error fetching course by ID:", error)
            throw new Error("Error fetching course.") // Re-throw or handle the error as needed
        }
    }

    async getAllCourses(): Promise<ICourse[]> {
        try {
            // Fetch courses filtered by userId
            const courses = await Course.find()
                .populate({
                    path: "userId", // Field in Course schema referencing User
                    select: "firstName lastName name", // Only fetch these fields
                })
                .exec()
            // Map courses to include firstName and lastName directly in the object
            const enrichedCourses = courses.map((course) => {
                const populatedUser = course.id as {
                    firstName: string
                    lastName: string
                } // Type assertion
                return {
                    ...course.toObject(),
                    firstName: populatedUser.firstName || "Unknown",
                    lastName: populatedUser.lastName || "User",
                }
            })

            console.log("Fetched Courses:", enrichedCourses)
            return enrichedCourses
        } catch (error: any) {
            console.error("Error fetching courses:", error.message) // Log the error for debugging
            throw new Error("Failed to fetch courses. Please try again later.") // Throw a user-friendly error message
        }
    }
    async update(
        courseId: string,
        iPosICourse: Partial<ICourse>
    ): Promise<ICourse | null> {
        try {
            // Find the course by its ID
            const course = await Course.findById(courseId) // Assuming `courseModel` is your model for accessing the database

            // If the course does not exist, return null
            if (!course) {
                console.error("Course not found")
                return null
            }

            // Update the course with the provided data (iPosICourse)
            const updatedCourse = await Course.findByIdAndUpdate(
                courseId,
                iPosICourse,
                {
                    new: true,
                }
            )

            // Return the updated course
            return updatedCourse
        } catch (error) {
            // Catch any errors and log them
            console.error("Error updating course:", error)
            throw new Error("Failed to update the course")
        }
    }
    async patch(
        courseId: string,
        iPosICourse: Partial<ICourse>
    ): Promise<ICourse | null> {
        console.log(iPosICourse)

        try {
            // Find the course by its ID
            const course = await Course.findById(courseId) // Assuming `courseModel` is your model for accessing the database

            // If the course does not exist, return null
            if (!course) {
                console.error("Course not found")
                return null
            }

            // Update the course with the provided data (iPosICourse)
            const updatedCourse = await Course.findByIdAndUpdate(
                courseId,
                iPosICourse,
                {
                    new: true,
                }
            )
            console.log(updatedCourse)
            // Return the updated course
            return updatedCourse
        } catch (error) {
            // Catch any errors and log them
            console.error("Error updating course:", error)
            throw new Error("Failed to update the course")
        }
    }
    async delete(courseId: string): Promise<boolean> {
        try {
            const result = await Course.findByIdAndDelete(courseId)

            if (result) {
                console.log(`Successfully deleted item with ID: ${courseId}`)
                return true
            } else {
                throw new Error(`No item found with ID: ${courseId}`)
            }
        } catch (error) {
            throw error // Re-throwing the error for further handling
        }
    }
    getCoursesByCategory(categoryId: string): Promise<ICourse[]> {
        throw new Error("Method not there.")
    }
}
