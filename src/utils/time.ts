export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000); // Ensure seconds is a number
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};
