import axios, { type AxiosResponse } from "axios"

// Types for the API
export interface Task {
  id: string
  message: string
  files?: File[]
  done: boolean
  msgtext?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  message: string
  files?: File[]
}

export interface CreateTaskResponse {
  id: string
  message: string
  done: boolean
  msgtext?: string
}

export interface TaskStatusResponse {
  id: string
  done: boolean
  msgtext?: string
  message: string
}

// API Service class with CRUD operations
class ApiService {
  private baseURL: string

  constructor(baseURL = "/api") {
    this.baseURL = baseURL
  }

  // Create a new task
  async createTask(data: CreateTaskRequest): Promise<CreateTaskResponse> {
    const formData = new FormData()
    formData.append("message", data.message)

    if (data.files && data.files.length > 0) {
      data.files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })
    }

    const response: AxiosResponse<CreateTaskResponse> = await axios.post(`${this.baseURL}/tasks`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  }

  // Read task status
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const response: AxiosResponse<TaskStatusResponse> = await axios.get(`${this.baseURL}/tasks/${taskId}`)

    return response.data
  }

  // Update task (if needed for future functionality)
  async updateTask(taskId: string, data: Partial<CreateTaskRequest>): Promise<TaskStatusResponse> {
    const response: AxiosResponse<TaskStatusResponse> = await axios.put(`${this.baseURL}/tasks/${taskId}`, data)

    return response.data
  }

  // Delete task (if needed for future functionality)
  async deleteTask(taskId: string): Promise<void> {
    await axios.delete(`${this.baseURL}/tasks/${taskId}`)
  }

  // Get all tasks for current session
  async getAllTasks(): Promise<Task[]> {
    const response: AxiosResponse<Task[]> = await axios.get(`${this.baseURL}/tasks`)

    return response.data
  }
}

// Export singleton instance
export const apiService = new ApiService()
