export { default as api } from './api';
export { useAuth } from './useAuth';


export const getImageUrl = (imagePath: string) => {
  return `${process.env.EXPO_PUBLIC_BACKEND_IMAGE_URL}/leaf/${imagePath}`;
}
export const getFileNameFromPath = (filePath: string): string => {
  return filePath.split("/").pop() || filePath;
};
