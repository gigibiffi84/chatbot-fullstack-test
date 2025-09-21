import axios, {type AxiosInstance, type AxiosResponse} from "axios"

// Types for the API
export interface Task {
    id: string
    msg: string
    files?: File[]
    done: boolean
    msgtext?: string
    createdAt: string
    updatedAt: string
}

export interface CreateTaskRequest {
    msg: string
    uuid: string
    files?: File[]
}

export interface CreateTaskResponse {

}

export interface TaskStatusResponse {
    uuid: string
    done: boolean
    msgresponse?: string
    message: string
}

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
        const formData = new FormData()
        formData.append("msg", data.msg)

        if (data.files && data.files.length > 0) {
            data.files.forEach((file, index) => {
                formData.append(`file_${index}`, file)
            })
        }

        /*const response: AxiosResponse<CreateTaskResponse> = await this.http.post(`tasks`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })*/

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
}

// Export singleton instance
export const apiService = new ApiService()
