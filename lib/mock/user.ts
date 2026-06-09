/**
 * 免登录测试模式 - 假用户配置
 *
 * 当启用 BYPASS_LOGIN 模式时，应用会使用这个假用户身份运行
 * 方便开发阶段快速测试，无需 Google 账号登录
 */

import { User } from '@/src/types';

export const MOCK_USER: User = {
  id: 'mock_user_123',
  email: 'test@terra.dev',
  name: '测试用户',
  avatar: '', // 使用默认头像
  createdAt: new Date().toISOString(),
};

// 如果需要自定义假用户信息，可以修改上面的 MOCK_USER 对象
// 或者创建多个假用户用于测试多用户场景

export const MOCK_USERS: Record<string, User> = {
  default: MOCK_USER,
  // 可以在这里添加更多假用户
  // demo: { ... },
};
