import axios, {type AxiosInstance, type AxiosResponse} from "axios"

// Types for the API
export interface Task {
    id: string
    msg: string
    files?: File[]
    done: boolean
    msgresponse?: string
    createdAt: string
    updatedAt: string
}

export interface CreateTaskRequest {
    msg: string
    uuid: string
    files?: File[]
    blobs?: string[]
    fileStructures?: {
        filename: string
        contentType: string
    }[]
}

export interface CreateTaskResponse {

}

export interface TaskStatusResponse {
    uuid: string
    done: boolean
    msgresponse?: string
    message: string
}

const toBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

// API Service class with CRUD operations
class ApiService {
    private baseURL: string
    private http: AxiosInstance
    
    constructor(baseURL = "/api") {
        this.baseURL = baseURL
        this.http = axios.create({
            baseURL: this.baseURL,
            withCredentials: true, // include cookies for session-based client recognition
        })
    }

    // Create a new task
    async createTask(data: CreateTaskRequest): Promise<CreateTaskResponse> {
        /*const formData = new FormData()
        formData.append("msg", data.msg)
        const fileObj = {}*/

        if (data.files && data.files.length > 0) {
            data.fileStructures = data.files.map((file) => ({
                filename: file.name,
                contentType: file.type
            }))
            const base64Promises = data.files.map((file) => {
                return toBase64(file)
            })
            data.blobs = await Promise.all(base64Promises)

        }

        const response: AxiosResponse<CreateTaskResponse> = await this.http.post(`tasks`, data, {
            headers: {
                "Content-Type": "application/json"
            },
        })



        return response.data
    }

    // Read task status
    async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
        const response: AxiosResponse<TaskStatusResponse> = await this.http.get(`tasks/${taskId}`)

        return response.data
    }

    // Update task (if needed for future functionality)
    async updateTask(taskId: string, data: Partial<CreateTaskRequest>): Promise<TaskStatusResponse> {
        const response: AxiosResponse<TaskStatusResponse> = await this.http.put(`tasks/${taskId}`, data)

        return response.data
    }

    // Delete task (if needed for future functionality)
    async deleteTask(taskId: string): Promise<void> {
        await this.http.delete(`tasks/${taskId}`)
    }

    // Get all tasks for current session
    async getAllTasks(): Promise<Task[]> {
        const response: AxiosResponse<Task[]> = await this.http.get(`tasks`)

        return response.data
    }

    // start new chat on backend side simply reset current session
    async startNewChat(): Promise<boolean> {
        await this.http.post(`newchat`)

        return Promise.resolve(true)
    }

    async getFileContent(taskId: string, fileName: string): Promise<string> {
        const response: AxiosResponse<{ content: string }> = await axios.get(
            `${this.baseURL}/tasks/${taskId}/files/${encodeURIComponent(fileName)}`,
        )

        return response.data.content
    }
}

// Export singleton instance
export const apiService = new ApiService()
