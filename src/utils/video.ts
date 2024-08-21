import {SkImage} from '@shopify/react-native-skia';
import {FFmpegKit, FFmpegKitConfig, Level} from 'ffmpeg-kit-react-native';
import RNFetchBlob from 'rn-fetch-blob';

FFmpegKitConfig.setLogLevel(Level.AV_LOG_ERROR);

export const convertVideoToMp3 = (
  videoUri: string,
  outputFileName: string,
  totalDurationInMilliSeconds: number,
  onProgress: (progress: number) => void,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      FFmpegKitConfig.enableStatisticsCallback(statistics => {
        console.log(statistics.getTime());
        const currentTimeInMilliSeconds = statistics.getTime();
        const progress =
          (currentTimeInMilliSeconds / totalDurationInMilliSeconds) * 100;
        onProgress(progress);
      });

      const outputUri = `${RNFetchBlob.fs.dirs.DocumentDir}/${outputFileName}.aac`;

      const ffmpegCommand = `-y -i ${videoUri} -codec:a aac -b:a 320k -map a ${outputUri}`;

      // Start the FFmpeg command asynchronously
      const sessionPromise = FFmpegKit.executeAsync(
        ffmpegCommand,
        async completedSession => {
          const returnCode = await completedSession.getReturnCode();
          console.log(completedSession.getAllLogs());

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

      const command = `-y -i ${videoUri} -ss 00:00:00 -vframes 1 ${outputUri}`;

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

export const saveFrames = (promiseFrames: Promise<SkImage>[]) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting frame saving');
      const frames = await Promise.all(promiseFrames);
      console.log('Frames array with promise:', frames.length);

      // Create an array of promises for writing images to files
      const writePromises = frames.map((image, i) => {
        const index = i + 1; // Start numbering from 1
        const filename = `frame_${String(index).padStart(6, '0')}.png`; // Zero-padded index
        const path = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;

        const base64Image = image.encodeToBase64();

        console.log(filename);

        // Return the promise for writing the file
        return RNFetchBlob.fs
          .writeFile(path, base64Image, 'base64')
          .then(() => {
            console.log('Rendered Image', filename);
          })
          .catch(error => {
            console.error('Error writing image:', filename, error);
            throw error; // Ensure rejection is propagated
          });
      });

      // Use Promise.all to resolve all write operations
      await Promise.all(writePromises);
      console.log('All frames saved successfully!');
      resolve('All frames saved successfully!');
    } catch (error) {
      console.error('Error saving frames:', error);
      reject(error);
    }
  });
};

export const generateVideoFromFrames = async (
  audioUrl: string,
  totalDurationInMilliSeconds: number,
  videoId: string,
  onProgress: (value: number) => void,
) => {
  return new Promise<string>((resolve, reject) => {
    try {
      // Enable statistics callback to capture progress
      FFmpegKitConfig.enableStatisticsCallback(statistics => {
        const currentTimeInSeconds = statistics.getTime();
        const progress =
          (currentTimeInSeconds / totalDurationInMilliSeconds) * 100;
        onProgress(progress);
      });

      // Define the input path pattern and output video path
      const inputPattern = `${RNFetchBlob.fs.dirs.CacheDir}/frame_%06d.png`; // Matches frame_000001.png, frame_000002.png, etc.
      const outputVideoPath = `${RNFetchBlob.fs.dirs.CacheDir}/${videoId}.mp4`;

      const ffmpegCommand = [
        '-y', // Overwrite existing files
        '-framerate',
        '30', // Frame rate for images
        '-i',
        inputPattern, // Input image pattern
        '-i',
        audioUrl, // Input audio
        '-c:v',
        'libx264', // H.264 codec for high-quality video
        '-preset',
        'slow', // Balance encoding speed and quality
        '-crf',
        '16', // Very high quality (lower CRF means better quality)
        '-b:v',
        '15M', // High video bitrate to preserve text quality
        '-pix_fmt',
        'yuv420p', // Ensures wide compatibility across platforms
        '-vf',
        'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p', // Scaling to ensure even dimensions
        '-tune',
        'animation', // Tune for text/graphics to preserve sharpness
        '-c:a',
        'aac', // Audio codec
        '-b:a',
        '320k', // High-quality audio bitrate
        '-movflags',
        '+faststart', // Optimized for web playback
        outputVideoPath, // Output video file path
      ].join(' ');

      // Execute the FFmpegKit command
      FFmpegKit.execute(ffmpegCommand)
        .then(async session => {
          const returnCode = await session.getReturnCode();
          if (returnCode.isValueSuccess()) {
            resolve(outputVideoPath);
          } else {
            reject(
              new Error(`FFmpegKit failed with return code: ${returnCode}`),
            );
          }
        })
        .catch(error => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

export const saveFrame = (image: SkImage, index: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const _index = index + 1;
      const filename = `frame_${String(_index).padStart(6, '0')}.png`; // Zero-padded index
      const path = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;
      const base64Image = image.encodeToBase64();

      return RNFetchBlob.fs
        .writeFile(path, base64Image, 'base64')
        .then(() => {
          resolve(path); // Resolve with the file path
        })
        .catch(error => {
          console.error('Error writing image:', filename, error);
          reject(error); // Reject with the error
        });
    } catch (error) {
      console.error('Error saving frames:', error);
      reject(error); // Reject with the caught error
    }
  });
};
