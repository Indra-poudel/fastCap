import RNFetchBlob from 'rn-fetch-blob';

export const createVideoDirectory = async (videoId: string) => {
  const videoDirectory = `${RNFetchBlob.fs.dirs.DocumentDir}/videos/${videoId}`;

  // Check if the directory exists, if not, create it
  const exists = await RNFetchBlob.fs.exists(videoDirectory);
  if (!exists) {
    await RNFetchBlob.fs.mkdir(videoDirectory);
  }
  return videoDirectory;
};

export const moveFileToVideoDirectory = async (
  srcPath: string,
  fileName: string,
  destinationPath: string,
  extension: string,
) => {
  const finalPath = `${destinationPath}/${fileName}${extension}`;

  await RNFetchBlob.fs.mv(srcPath.replace('file://', ''), finalPath);

  return `file://${finalPath}`;
};

export const deleteVideoDirectory = async (videoId: string): Promise<void> => {
  const videoDirectory = `${RNFetchBlob.fs.dirs.DocumentDir}/videos/${videoId}`;

  try {
    const exists = await RNFetchBlob.fs.exists(videoDirectory);
    if (exists) {
      await RNFetchBlob.fs.unlink(videoDirectory);
      console.log('Video directory deleted:', videoDirectory);
    } else {
      console.log('Video directory does not exist.');
    }
  } catch (error) {
    console.error('Error deleting video directory:', error);
  }
};

export const deleteVideoFramesDirectory = async (
  videoId: string,
): Promise<void> => {
  const videoDirectory = `${RNFetchBlob.fs.dirs.DocumentDir}/videos/${videoId}/frames`;

  try {
    const exists = await RNFetchBlob.fs.exists(videoDirectory);
    if (exists) {
      await RNFetchBlob.fs.unlink(videoDirectory);
      console.log('Video directory deleted:', videoDirectory);
    } else {
      console.log('Video directory does not exist.');
    }
  } catch (error) {
    console.error('Error deleting video directory:', error);
  }
};

export const deleteGeneratedVideo = async (videoId: string): Promise<void> => {
  const videoDirectory = `${RNFetchBlob.fs.dirs.DocumentDir}/videos/${videoId}/output_${videoId}.mp4`;

  try {
    const exists = await RNFetchBlob.fs.exists(videoDirectory);
    if (exists) {
      await RNFetchBlob.fs.unlink(videoDirectory);
      console.log('Video directory deleted:', videoDirectory);
    } else {
      console.log('Video directory does not exist.');
    }
  } catch (error) {
    console.error('Error deleting video directory:', error);
  }
};
