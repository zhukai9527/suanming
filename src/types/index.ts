export interface UserProfile {
  id: string;
  user_id: string;
  username?: string;
  full_name: string;
  birth_date: string;
  birth_time?: string;
  birth_location?: string;
  gender: 'male' | 'female';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRecord {
  id: string;
  user_id: string;
  analysis_type: 'bazi' | 'ziwei' | 'yijing';
  name: string;
  birth_date: string;
  birth_time?: string;
  birth_place?: string;
  gender: string;
  input_data: any;
  analysis_results: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface NumerologyReading {
  id: string;
  user_id: string;
  profile_id?: string;
  reading_type: 'bazi' | 'ziwei' | 'yijing' | 'comprehensive';
  name: string;
  birth_date: string;
  birth_time?: string;
  gender: string;
  birth_place?: string;
  input_data: string | any; // JSON字符串或已解析的对象
  analysis: {
    bazi?: { bazi_analysis: any };
    ziwei?: { ziwei_analysis: any };
    yijing?: { yijing_analysis: any };
    metadata: {
      analysis_time: string;
      version: string;
      analysis_type: string;
    };
  };
  results: any; // 保持向后兼容
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface AnalysisRequest {
  user_id: string;
  birth_data: {
    name: string;
    birth_date: string;
    birth_time?: string;
    gender: 'male' | 'female';
    birth_place?: string;
    question?: string; // for yijing
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}