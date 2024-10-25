import {ImageFormat, SkImage} from '@shopify/react-native-skia';
import {
  FFmpegKit,
  FFmpegKitConfig,
  FFprobeKit,
  Level,
} from 'ffmpeg-kit-react-native';
import RNFetchBlob from 'rn-fetch-blob';

FFmpegKitConfig.setLogLevel(Level.AV_LOG_ERROR);

export const convertVideoToMp3 = (
  videoUri: string,
  videoId: string,
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

      const outputUri = `${RNFetchBlob.fs.dirs.DocumentDir}/videos/${videoId}/exacted_audio_${videoId}.mp3`;

      const ffmpegCommand = `-y -i ${videoUri} -codec:a libmp3lame -map a ${outputUri}`;

      // Start the FFmpeg command asynchronously
      const sessionPromise = FFmpegKit.executeAsync(
        ffmpegCommand,
        async completedSession => {
          const returnCode = await completedSession.getReturnCode();
          console.log(completedSession.getAllLogs());

          if (returnCode.isValueSuccess()) {
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

export const generateThumbnail = async (
  videoUri: string,
  id: string,
): Promise<{
  thumbnailURL: string;
  videoInfo: VideoInfo;
}> => {
  try {
    const outputUri = `${RNFetchBlob.fs.dirs.DocumentDir}/videos/${id}/thumbnail_${id}.png`;

    // Remove the existing file if it exists
    try {
      await RNFetchBlob.fs.unlink(outputUri);
    } catch (error) {
      // Ignore the error if the file does not exist
    }

    // Get correct video dimensions and rotation
    const videoInfo = await getCorrectVideoDimensions(videoUri);

    if (videoInfo) {
      const {rotation} = videoInfo;

      // Adjust the rotation for FFmpeg thumbnail generation
      let rotateFilter = '';
      if (rotation === 90) {
        rotateFilter = 'transpose=1';
      } else if (rotation === 180) {
        rotateFilter = 'transpose=2,transpose=2'; // Rotate 180 degrees
      } else if (rotation === 270 || rotation === -90) {
        rotateFilter = 'transpose=2';
      }

      const command = `-y -i ${videoUri} -ss 00:00:00 -vframes 1 ${
        rotateFilter ? `-vf "${rotateFilter}"` : ''
      } ${outputUri}`;

      // Execute FFmpeg command to generate the thumbnail
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();

      if (returnCode.isValueSuccess()) {
        return {
          thumbnailURL: `file://${outputUri}`,
          videoInfo: videoInfo,
        };
      } else {
        throw new Error('FFmpeg command failed');
      }
    } else {
      throw new Error('Failed to get video dimensions');
    }
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
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
  videoUrl: string,
  totalDurationInMilliSeconds: number,
  videoId: string,
  framerate: string,
  x: number,
  y: number,
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
      const inputPattern = `${RNFetchBlob.fs.dirs.DocumentDir}/videos/${videoId}/frames/frame_%06d.png`;
      const outputVideoPath = `${RNFetchBlob.fs.dirs.DocumentDir}/videos/${videoId}/output_${videoId}.mp4`;

      const ffmpegCommand = [
        '-y', // Overwrite existing files
        '-i',
        videoUrl, // Input video with audio
        '-framerate',
        framerate, // Frame rate for images
        '-i',
        inputPattern, // Input image pattern for subtitles
        '-filter_complex',
        `[0:v][1:v]overlay=${x}:${y}`,
        '-c:v',
        'libx264', // H.264 codec for high-quality video
        '-preset',
        'ultrafast', // Balance encoding speed and quality
        '-crf',
        '16', // Very high quality (lower CRF means better quality)
        '-b:v',
        '15M', // High video bitrate to preserve text quality
        '-pix_fmt',
        'yuv420p', // Ensures wide compatibility across platforms
        '-c:a',
        'copy', // Keep the original audio
        '-movflags',
        '+faststart', // Optimized for web playback
        '-threads',
        'auto',
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

export const saveFrame = (
  image: SkImage,
  index: number,
  videoId: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const _index = index + 1;
      const filename = `frame_${String(_index).padStart(6, '0')}.png`; // Zero-padded index
      const path = `${RNFetchBlob.fs.dirs.DocumentDir}/videos/${videoId}/frames/${filename}`;
      const base64Image = image.encodeToBase64(ImageFormat.PNG, 100);

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

type VideoInfo = {
  width: number;
  height: number;
  rotation: number;
};

const getCorrectVideoDimensions = async (
  videoUrl: string,
): Promise<{width: number; height: number; rotation: number} | null> => {
  try {
    const session = await FFprobeKit.getMediaInformation(videoUrl);
    const information = await session.getMediaInformation();

    if (information !== undefined) {
      const videoStreams = information.getStreams();

      for (const stream of videoStreams) {
        if (stream.getType() === 'video') {
          const width = stream.getWidth();
          const height = stream.getHeight();
          const properties = stream.getAllProperties();

          // Extract rotation from side_data_list if available
          const rotation =
            properties.side_data_list?.find(
              (sideData: {side_data_type: string; rotation?: number}) =>
                sideData.side_data_type === 'Display Matrix',
            )?.rotation || 0;

          return {width, height, rotation};
        }
      }
    } else {
      console.error('Unable to retrieve media information.');
    }
  } catch (error) {
    console.error('Error retrieving video dimensions and rotation:', error);
  }

  return null;
};
