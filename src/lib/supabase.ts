// 本地化改造：使用本地API替代Supabase
import { localApi } from './localApi';

// 导出本地API客户端，保持与原Supabase客户端相同的接口
export const supabase = localApi;

// 为了向后兼容，也可以导出为默认
export default localApi;