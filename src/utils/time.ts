export const formatDuration = (seconds: number): string => {
  if (seconds < 0 || isNaN(seconds)) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};
