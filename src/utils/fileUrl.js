export const getFileUrl = (filePath) => {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const apiUrl = (
    import.meta.env.VITE_API_URL ||
    'https://student-portal-backend-aqst.onrender.com/api'
  ).trim();

  return `${apiUrl.replace(/\/api\/?$/, "")}${filePath}`;
};
