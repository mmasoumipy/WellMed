import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  modules?: CourseModule[];
  // Progress fields when fetched with user progress
  progress_percentage?: number;
  is_completed?: boolean;
  last_accessed_at?: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  content: string;
  duration?: string;
  module_type: 'reading' | 'video' | 'interactive' | 'exercise';
  sort_order: number;
  key_takeaways?: string[];
  action_items?: string[];
  image_path?: string;
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
  module_progresses?: ModuleProgress[];
}

export interface ModuleProgress {
  id: string;
  user_course_progress_id: string;
  module_id: string;
  is_completed: boolean;
  completion_date?: string;
  time_spent_seconds: number;
  started_at: string;
  completed_at?: string;
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

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  courses: Course[];
}

class CourseService {
  // Get all courses with user progress
  async getCoursesWithProgress(): Promise<Course[]> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      const response = await api.get(`/courses/user/${userId}/courses`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses with progress:', error);
      throw error;
    }
  }

  // Get courses by category with user progress
  async getCoursesByCategory(): Promise<CourseCategory[]> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      const response = await api.get(`/courses/user/${userId}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      throw error;
    }
  }

  // Get specific course with modules
  async getCourse(courseId: string): Promise<Course> {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  // Start a course (create progress record)
  async startCourse(courseId: string): Promise<CourseProgress> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      const response = await api.post(`/courses/user/${userId}/courses/${courseId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting course:', error);
      throw error;
    }
  }

  // Get user's progress for a specific course
  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      const response = await api.get(`/courses/user/${userId}/courses/${courseId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  }

  // Complete a module
  async completeModule(courseId: string, moduleId: string): Promise<void> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      const response = await api.post(`/courses/user/${userId}/courses/${courseId}/modules/${moduleId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing module:', error);
      throw error;
    }
  }

  // Update time spent on module
  async updateModuleTime(courseId: string, moduleId: string, timeSpentSeconds: number): Promise<void> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      await api.put(`/courses/user/${userId}/courses/${courseId}/modules/${moduleId}/time`, null, {
        params: { time_spent_seconds: timeSpentSeconds }
      });
    } catch (error) {
      console.error('Error updating module time:', error);
      throw error;
    }
  }

  // Get all user course progress
  async getAllUserProgress(): Promise<CourseProgress[]> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      const response = await api.get(`/courses/user/${userId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  // Get user course statistics
  async getUserCourseStats(): Promise<CourseStats> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      const response = await api.get(`/courses/user/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course stats:', error);
      throw error;
    }
  }

  // Search courses
  async searchCourses(query: string, category?: string, difficulty?: string): Promise<Course[]> {
    try {
      const params = new URLSearchParams({ q: query });
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);

      const response = await api.get(`/courses/search/courses?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  // Get recommended courses
  async getRecommendedCourses(limit: number = 5): Promise<Course[]> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      const response = await api.get(`/courses/recommended/${userId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      throw error;
    }
  }

  // Cache management for offline support
  async cacheCoursesData(courses: Course[]): Promise<void> {
    try {
      await AsyncStorage.setItem('cachedCourses', JSON.stringify(courses));
      await AsyncStorage.setItem('coursesLastFetch', new Date().toISOString());
    } catch (error) {
      console.error('Error caching courses data:', error);
    }
  }

  async getCachedCoursesData(): Promise<Course[] | null> {
    try {
      const cachedData = await AsyncStorage.getItem('cachedCourses');
      const lastFetch = await AsyncStorage.getItem('coursesLastFetch');
      
      if (!cachedData || !lastFetch) return null;

      // Check if cache is still valid (24 hours)
      const lastFetchTime = new Date(lastFetch);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastFetchTime.getTime()) / (1000 * 60 * 60); 
      
      if (hoursDiff > 24) return null;

      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error getting cached courses data:', error);
      return null;
    }
  }

  // Clear cache when user logs out
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        'cachedCourses',
        'coursesLastFetch',
        'courseProgress',
        'completedCourses'
      ]);
    } catch (error) {
      console.error('Error clearing courses cache:', error);
    }
  }
}

export const courseService = new CourseService();
export default courseService;