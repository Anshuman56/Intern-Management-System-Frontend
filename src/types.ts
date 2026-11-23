export type Role = 'admin' | 'intern'
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed'
export type Priority = 'Low' | 'Medium' | 'High'

export const TASK_STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Completed']
export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High']

export interface AuthUser {
  _id: string
  name: string
  email: string
  role: Role
}

export interface Intern {
  _id: string
  name: string
  email: string
  phone?: string
  department?: string
  joiningDate?: string
  isActive: boolean
}

export interface Task {
  _id: string
  title: string
  description?: string
  assignedTo: Pick<Intern, '_id' | 'name' | 'email' | 'department'> | string
  deadline: string
  priority: Priority
  status: TaskStatus
}

export interface Submission {
  _id: string
  task: Pick<Task, '_id' | 'title' | 'status' | 'deadline' | 'priority'> | null
  intern: Pick<Intern, '_id' | 'name' | 'email' | 'department'> | null
  description?: string
  githubUrl?: string
  docLink?: string
  adminFeedback: string
  submittedAt: string
}
