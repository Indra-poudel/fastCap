import {FFmpegKit} from 'ffmpeg-kit-react-native';
import RNFetchBlob from 'rn-fetch-blob';

export const convertVideoToMp3 = async (
  videoUri: string,
  outputFileName: string,
): Promise<string> => {
  try {
    const outputUri = `${RNFetchBlob.fs.dirs.DocumentDir}/${outputFileName}.mp3`;

    // Specify the libmp3lame encoder
    const ffmpegCommand = `-y -i ${videoUri} -codec:a libmp3lame -q:a 0 -map a ${outputUri}`;

    // Start the FFmpeg command asynchronously
    const sessionPromise = FFmpegKit.executeAsync(
      ffmpegCommand,
      async completedSession => {
        const returnCode = await completedSession.getReturnCode();
        if (returnCode.isValueSuccess()) {
          console.log(`Video converted successfully: ${outputUri}`);
        } else {
          console.error(`Failed to convert video. Return code: ${returnCode}`);
        }
      },
      () => {},
    );

    await sessionPromise;

    return outputUri; // Return the path to the converted MP3 file
  } catch (error) {
    console.error('Error converting video to MP3:', error);
    throw error;
  }
};
