// TODO: Replace with real endpoint paths when backend is ready
export const apiClient = {
  get: async (url) => { console.log('GET', url); return { data: [] }; },
  post: async (url, data) => { console.log('POST', url, data); return { data }; },
  put: async (url, data) => { console.log('PUT', url, data); return { data }; },
  delete: async (url) => { console.log('DELETE', url); return { data: true }; },
};\n