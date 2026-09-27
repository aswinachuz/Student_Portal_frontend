export const getFileUrl = (filePath) => {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "";

  return `${apiUrl.replace(/\/api\/?$/, "")}${filePath}`;
};
