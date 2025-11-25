import api from './api'

class CourseService {
  
  async list() {
    const response = await api.get('/courses')
    return response.data
  }
}

export const courseService = new CourseService()