import {ASSEMBLY_AI_API_KEY} from 'constants/keys';
import RNFetchBlob from 'rn-fetch-blob';

const BASE_URL = 'https://api.assemblyai.com/v2';

interface UploadProgressCallback {
  (progress: number): void;
}

interface UploadResponse {
  upload_url: string;
}

export const uploadAudio = async (
  fileUri: string,
  onUploadProgress?: UploadProgressCallback,
): Promise<string> => {
  try {
    const file = await RNFetchBlob.fs.readFile(fileUri, 'base64');

    const response = await RNFetchBlob.fetch(
      'POST',
      `${BASE_URL}/upload`,
      {
        'Content-Type': 'application/octet-stream',
        Authorization: ASSEMBLY_AI_API_KEY,
      },
      file,
    ).uploadProgress({interval: 10}, (written, total) => {
      const progress = Math.round((written / total) * 100);
      if (onUploadProgress) {
        onUploadProgress(progress);
      }
    });

    if (response.respInfo.status === 200) {
      onUploadProgress && onUploadProgress(100);
      const data: UploadResponse = JSON.parse(response.data);
      return data.upload_url;
    } else {
      throw new Error(`Upload failed with status ${response.respInfo.status}`);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
