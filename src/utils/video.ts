import {FFmpegKit, FFmpegKitConfig, Level} from 'ffmpeg-kit-react-native';
import RNFetchBlob from 'rn-fetch-blob';

export const convertVideoToMp3 = (
  videoUri: string,
  outputFileName: string,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
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
            resolve(outputUri); // Resolve the promise with the output URI
          } else {
            console.error(
              `Failed to convert video. Return code: ${returnCode}`,
            );
            reject(
              new Error(`Failed to convert video. Return code: ${returnCode}`),
            ); // Reject the promise with an error
          }
        },
        () => {},
      );

      await sessionPromise;
    } catch (error) {
      console.error('Error converting video to MP3:', error);
      reject(error); // Reject the promise with the caught error
    }
  });
};

export const generateThumbnail = (
  videoUri: string,
  id: string,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const outputUri = `${RNFetchBlob.fs.dirs.DocumentDir}/${id}.jpg`;

      // Remove the existing file if it exists
      try {
        await RNFetchBlob.fs.unlink(outputUri);
      } catch (error) {
        // Ignore the error if the file does not exist
      }

      const command = `-y -i ${videoUri} -ss 00:00:01 -vframes 1 ${outputUri}`;

      FFmpegKitConfig.setLogLevel(Level.AV_LOG_ERROR);

      // Execute FFmpeg command to generate the thumbnail
      FFmpegKit.execute(command)
        .then(async session => {
          const returnCode = await session.getReturnCode();

          if (returnCode.isValueSuccess()) {
            resolve(`file://${outputUri}`);
          } else {
            reject(new Error('FFmpeg command failed'));
          }
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      reject(error); // Reject the promise with the caught error
    }
  });
};
