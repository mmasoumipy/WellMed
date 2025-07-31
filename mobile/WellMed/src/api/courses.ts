import api from './api';

export interface CourseModule {
  id: string;
  module_id: string;
  title: string;
  content: string;
  duration: string;
  module_type: 'reading' | 'video' | 'interactive' | 'exercise' | 'audio';
  sort_order: number;
  key_takeaways: string[];
  action_items?: string[];
  image_path?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  color: string;
  category: string;
  modules_count: number;
  is_active: boolean;
  sort_order: number;
  image_path?: string;
  created_at: string;
  updated_at: string;
  modules?: CourseModule[];
  // Progress fields (when fetched with user progress)
  progress_percentage?: number;
  is_completed?: boolean;
  last_accessed_at?: string;
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  courses: Course[];
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  is_completed: boolean;
  completion_date?: string;
  started_at: string;
  last_accessed_at: string;
}

export interface CourseStats {
  total_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  total_modules_completed: number;
  overall_progress_percentage: number;
  favorite_category?: string;
  total_time_spent_minutes: number;
}

class CourseAPI {
  // Get all courses
  async getAllCourses(category?: string): Promise<Course[]> {
    const params = category ? { category } : {};
    const response = await api.get('/courses/', { params });
    return response.data;
  }

  // Get courses with user progress
  async getCoursesWithProgress(userId: string, category?: string): Promise<Course[]> {
    const params = category ? { category } : {};
    const response = await api.get(`/courses/user/${userId}/courses`, { params });
    return response.data;
  }

  // Get courses organized by category
  async getCoursesByCategory(userId: string): Promise<CourseCategory[]> {
    const response = await api.get(`/courses/user/${userId}/categories`);
    return response.data;
  }

  // Get specific course with modules
  async getCourse(courseId: string): Promise<Course> {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  }

  // Start a course
  async startCourse(userId: string, courseId: string): Promise<CourseProgress> {
    const response = await api.post(`/courses/user/${userId}/courses/${courseId}/start`);
    return response.data;
  }

  // Get user's progress for a specific course
  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
    const response = await api.get(`/courses/user/${userId}/courses/${courseId}/progress`);
    return response.data;
  }

  // Complete a module
  async completeModule(userId: string, courseId: string, moduleId: string): Promise<any> {
    const response = await api.post(`/courses/user/${userId}/courses/${courseId}/modules/${moduleId}/complete`);
    return response.data;
  }

  // Update time spent on a module
  async updateModuleTime(userId: string, courseId: string, moduleId: string, timeSpentSeconds: number): Promise<any> {
    const response = await api.put(`/courses/user/${userId}/courses/${courseId}/modules/${moduleId}/time`, null, {
      params: { time_spent_seconds: timeSpentSeconds }
    });
    return response.data;
  }

  // Get all user progress
  async getAllUserProgress(userId: string): Promise<CourseProgress[]> {
    const response = await api.get(`/courses/user/${userId}/progress`);
    return response.data;
  }

  // Get user course statistics
  async getUserCourseStats(userId: string): Promise<CourseStats> {
    const response = await api.get(`/courses/user/${userId}/stats`);
    return response.data;
  }

  // Search courses
  async searchCourses(query: string, category?: string, difficulty?: string): Promise<Course[]> {
    const params: any = { q: query };
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    
    const response = await api.get('/courses/search/courses', { params });
    return response.data;
  }

  // Get recommended courses
  async getRecommendedCourses(userId: string, limit: number = 5): Promise<Course[]> {
    const response = await api.get(`/courses/recommended/${userId}`, {
      params: { limit }
    });
    return response.data;
  }
}

export const courseAPI = new CourseAPI();