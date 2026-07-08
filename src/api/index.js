import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  sendSms: (data) => api.post('/auth/send-sms', data),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const streamAPI = {
  getStreams: (params) => api.get('/streams', { params }),
  getStream: (roomId) => api.get(`/streams/${roomId}`),
  createStream: (data) => api.post('/streams', data),
  updateStream: (roomId, data) => api.put(`/streams/${roomId}`, data),
  endStream: (roomId) => api.put(`/streams/${roomId}/end`),
  enterStream: (roomId, data) => api.post(`/streams/${roomId}/enter`, data),
  leaveStream: (roomId) => api.post(`/streams/${roomId}/leave`),
  getViewers: (roomId) => api.get(`/streams/${roomId}/viewers`),
  getFollowingStreams: () => api.get('/streams/following'),
};

export const giftAPI = {
  getGifts: () => api.get('/gifts'),
  sendGift: (data) => api.post('/gifts/send', data),
  getGiftRecords: (roomId, params) => api.get(`/gifts/${roomId}/records`, { params }),
  getRanking: (roomId) => api.get(`/gifts/${roomId}/ranking`),
};

export const followAPI = {
  follow: (data) => api.post('/follows/follow', data),
  unfollow: (data) => api.post('/follows/unfollow', data),
  getFollowing: () => api.get('/follows/following'),
  getFollowers: () => api.get('/follows/followers'),
  checkFollow: (followeeId) => api.get('/follows/check', { params: { followeeId } }),
};

export const userAPI = {
  getUser: (userId) => api.get(`/users/${userId}`),
  searchUsers: (params) => api.get('/users', { params }),
  recharge: (data) => api.post('/users/recharge', data),
  withdraw: (data) => api.post('/users/withdraw', data),
  getTransactions: (userId, params) => api.get(`/users/${userId}/transactions`, { params }),
  getVideos: (userId) => api.get(`/users/${userId}/videos`),
  getStreams: (userId) => api.get(`/users/${userId}/streams`),
  getContribution: (userId) => api.get(`/users/${userId}/contribution`),
  getFollowingVideos: () => api.get('/users/following/videos'),
  getNotifications: (params) => api.get('/notifications', { params }),
};

export const bannerAPI = {
  getBanners: () => api.get('/banners'),
};

export const certificationAPI = {
  submit: (data) => api.post('/certifications/submit', data),
  getMy: () => api.get('/certifications/my'),
};

export const favoriteAPI = {
  addVideo: (data) => api.post('/favorites/video', data),
  removeVideo: (videoId) => api.delete(`/favorites/video/${videoId}`),
  getVideos: (params) => api.get('/favorites/videos', { params }),
  checkVideo: (videoId) => api.get(`/favorites/video/${videoId}/check`),
};

export const levelConfigAPI = {
  getConfigs: (params) => api.get('/level-configs', { params }),
  getConfig: (id) => api.get(`/level-configs/${id}`),
  createConfig: (data) => api.post('/level-configs', data),
  updateConfig: (id, data) => api.put(`/level-configs/${id}`, data),
  deleteConfig: (id) => api.delete(`/level-configs/${id}`),
};
