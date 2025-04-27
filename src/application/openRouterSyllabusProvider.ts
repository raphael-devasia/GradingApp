import fetch from "node-fetch"
import { Syllabus } from "../domain/models/syllabus.interface"

export class OpenRouterSyllabusProvider {
    private readonly apiKey: string
    private readonly apiUrl: string =
        "https://openrouter.ai/api/v1/chat/completions"
    private readonly models: string[] = [
        "mistralai/mixtral-8x7b-instruct",
        "meta-llama/llama-3.1-8b-instruct",
    ]
    private readonly defaultParams = {
        temperature: 0.7,
        max_tokens: 2000,
    }

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    async generateSyllabusContent(
        prompt: string,
        syllabusDetails: Partial<Syllabus>,
        fileContent?: string
    ): Promise<Syllabus> {
        let lastError: Error | null = null

        for (const model of this.models) {
            try {
                const result: Syllabus = await this.tryModel(
                    model,
                    prompt,
                    syllabusDetails,
                    fileContent
                )
                return result
            } catch (error) {
                lastError =
                    error instanceof Error ? error : new Error(String(error))
                console.error(`Model ${model} failed: ${lastError.message}`)
                continue
            }
        }

        throw new Error(
            `All models failed. Last error: ${
                lastError?.message || "Unknown error"
            }`
        )
    }

    private async tryModel(
        model: string,
        prompt: string,
        syllabusDetails: Partial<Syllabus>,
        fileContent?: string
    ): Promise<Syllabus> {
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
        }

        // Define the expected JSON structure
        const expectedStructure = {
            courseTitle: "string",
            instructor: "string",
            term: "string",
            courseDescription: "string",
            subject: "string",
            gradeLevel: "string",
            learningObjectives: ["string"],
            requiredMaterials: [
                {
                    title: "string",
                    author: "string",
                    publisher: "string",
                    year: "string",
                    required: "boolean",
                },
            ],
            gradingPolicy: {
                "<category>": {
                    percentage: "number",
                    description: "string",
                },
            },
            weeklySchedule: [
                {
                    week: "number",
                    topic: "string",
                    readings: "string",
                    assignments: "string",
                },
            ],
            policies: {
                "<policy>": "string",
            },
        }

        const body = {
            model,
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant that generates educational syllabi in JSON format. The output MUST be a valid JSON object matching this structure: ${JSON.stringify(
                        expectedStructure,
                        null,
                        2
                    )}. All fields are required, and the output must conform to the schema. For example, learningObjectives must be an array of strings, requiredMaterials must be an array of objects with the specified fields, gradingPolicy must be an object with percentage summing to 100%, weeklySchedule must be an array of objects, and policies must be an object with string values. Ensure the JSON is properly formatted and includes all required fields as specified in the prompt.`,
                },
                {
                    role: "user",
                    content: `${prompt}${
                        fileContent
                            ? `\n\nAdditional context:\n${fileContent}`
                            : ""
                    }`,
                },
            ],
            response_format: { type: "json_object" },
            ...this.defaultParams,
        }

        console.log("Request body:", JSON.stringify(body, null, 2))

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        })
        
        

        let responseData: any
        try {
            responseData = await response.json()
            console.log(
                "Raw API response:",
                JSON.stringify(responseData, null, 2)
            )
        } catch {
            const responseText = await response.text()
            console.error("Non-JSON response:", responseText)
            throw new Error(`Non-JSON response from API: ${responseText}`)
        }

        if (!response.ok) {
            const error = responseData.error || {}
            if (
                error.code === 400 &&
                error.message?.includes("not a valid model ID")
            ) {
                throw new Error(
                    `Invalid model ID: ${model}. Please verify with OpenRouter.`
                )
            } else if (error.code === 401) {
                throw new Error("Invalid API key. Check OPENROUTER_API_KEY.")
            } else if (error.code === 429) {
                throw new Error("Rate limit exceeded. Try again later.")
            } else if (error.code === 403) {
                throw new Error(
                    `Insufficient credits or permissions for model: ${model}`
                )
            }
            throw new Error(
                `OpenRouter API error: ${response.status} - ${JSON.stringify(
                    error
                )}`
            )
        }

        const content = responseData.choices[0]?.message?.content
        if (!content) {
            throw new Error(`Model ${model} returned empty content`)
        }

        let parsedContent: Syllabus
        try {
            parsedContent = JSON.parse(content) as Syllabus
            console.log(
                "Parsed content:",
                JSON.stringify(parsedContent, null, 2)
            )
        } catch (error) {
            console.error("Invalid JSON content:", content)
            throw new Error(`Model ${model} returned invalid JSON: ${content}`)
        }

        return parsedContent
    }

    async getAvailableModels(): Promise<any[]> {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
            headers: { Authorization: `Bearer ${this.apiKey}` },
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`)
        }

        const data = await response.json()
        return data.data
    }
}
