import { levelConfigAPI } from '../api';

let userLevelConfigs = [];
let hostLevelConfigs = [];

export const loadLevelConfigs = async () => {
  try {
    const userResponse = await levelConfigAPI.getConfigs({ type: 'user' });
    userLevelConfigs = userResponse.data || [];
    
    const hostResponse = await levelConfigAPI.getConfigs({ type: 'host' });
    hostLevelConfigs = hostResponse.data || [];
  } catch (error) {
    console.error('Failed to load level configs:', error);
  }
};

export const getUserLevelConfig = (exp) => {
  const config = userLevelConfigs.find(c => exp >= c.min_exp && exp < c.max_exp);
  return config || userLevelConfigs[0] || { level: 1, name: 'LV.1 新手', icon: '⭐', color: '#9ca3af' };
};

export const getHostLevelConfig = (hostExp) => {
  const config = hostLevelConfigs.find(c => hostExp >= c.min_exp && hostExp < c.max_exp);
  return config || hostLevelConfigs[0] || { level: 1, name: 'LV.1 新手主播', icon: '🎤', color: '#9ca3af' };
};

export const getUserLevelByLevelNum = (levelNum) => {
  const config = userLevelConfigs.find(c => c.level === levelNum);
  return config || { level: levelNum, name: `LV.${levelNum}`, icon: '⭐', color: '#9ca3af' };
};

export const getHostLevelByLevelNum = (levelNum) => {
  const config = hostLevelConfigs.find(c => c.level === levelNum);
  return config || { level: levelNum, name: `LV.${levelNum} 主播`, icon: '🎤', color: '#9ca3af' };
};

export const getUserLevelConfigs = () => [...userLevelConfigs];
export const getHostLevelConfigs = () => [...hostLevelConfigs];