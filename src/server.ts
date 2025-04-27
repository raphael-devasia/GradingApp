import express, { Request, Response, NextFunction } from "express"
import bodyParser from "body-parser"
import morgan from "morgan"
import dotenv from "dotenv"
import cors from "cors"
import { connectMongoDB } from "./infrastructure/db/models/mongoConfig"
import routes from "./infrastructure/routes"
import { cleanupInactiveUsers } from "./infrastructure/jobs/cleanupInactiveUsers"
import stripeRoutes from "./infrastructure/routes/stripe"

dotenv.config()

const app = express()
app.use(morgan("dev"))
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*", 
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
)

// Test route
app.get("/test", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Test route is working!",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    })
})

// Auth test route
app.get("/api/auth/test", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Auth test route is working!",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
        authStatus: "No authentication implemented",
    })
})

app.use("/api/stripe", stripeRoutes)
app.use(bodyParser.json())
connectMongoDB()

app.use("/api", routes)

// Run cleanup only in non-serverless context
if (process.env.NODE_ENV !== "production") {
    cleanupInactiveUsers()
}

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === "production" ? {} : err.message,
    })
})

export default app


    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })

