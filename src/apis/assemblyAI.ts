import {SentencesResponse, TranscribeParams, Transcript} from 'assemblyai';
import axios from 'axios';
import {ASSEMBLY_AI_API_KEY} from 'constants/keys';
import RNFetchBlob from 'rn-fetch-blob';

const BASE_URL = 'https://api.assemblyai.com/v2';

const assemblyAi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: ASSEMBLY_AI_API_KEY,
  },
});

export const uploadAudio = async (
  fileUri: string,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  try {
    const file = await RNFetchBlob.fs.readFile(fileUri, 'base64');

    let uploadProgress = 0;
    let downloadProgress = 0;

    const response = await RNFetchBlob.fetch(
      'POST',
      `${BASE_URL}/upload`,
      {
        'Content-Type': 'application/octet-stream',
        Authorization: ASSEMBLY_AI_API_KEY,
      },
      file,
    )
      .uploadProgress({interval: 250}, (written, total) => {
        uploadProgress = Math.round((written / total) * 100);
        if (onProgress) {
          const combinedProgress = uploadProgress * 0.5; // Upload progress is the first 50%
          onProgress(combinedProgress);
        }
      })
      .progress({interval: 250}, (received, total) => {
        downloadProgress = Math.round((received / total) * 100);
        if (onProgress) {
          const combinedProgress = 50 + downloadProgress * 0.5; // Combine upload (50%) and download progress (next 50%)
          onProgress(combinedProgress);
        }
      });

    if (response.respInfo.status === 200) {
      if (onProgress) {
        onProgress(100); // Ensure progress is marked as 100% on success
      }
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

export const generateTranscription = async (
  params: TranscribeParams,
  onProgress?: (progress: number) => void,
) => {
  let uploadProgress = 0;
  let downloadProgress = 0;

  const response = await assemblyAi.post<Transcript>('/transcript', params, {
    onUploadProgress: progressEvent => {
      if (progressEvent.total) {
        uploadProgress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
      } else {
        uploadProgress = 100;
      }
      if (onProgress) {
        const combinedProgress = uploadProgress * 0.5 + downloadProgress * 0.5;
        console.log('Upload Progress:', uploadProgress);
        console.log('Combined Progress (upload):', combinedProgress);
        onProgress(combinedProgress);
      }
    },
    onDownloadProgress: progressEvent => {
      if (progressEvent.total) {
        downloadProgress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
      } else {
        downloadProgress = 100;
      }
      if (onProgress) {
        const combinedProgress = uploadProgress * 0.5 + downloadProgress * 0.5;
        console.log('Download Progress:', downloadProgress);
        console.log('Combined Progress (download):', combinedProgress);
        onProgress(combinedProgress);
      }
    },
  });

  return response;
};

export const getTranscriptionById = async (
  transcriptionId: string,
  onProgress?: (progress: number) => void,
) => {
  let downloadProgress = 0;

  return await assemblyAi.get<Transcript>(`/transcript/${transcriptionId}`, {
    onDownloadProgress: progressEvent => {
      if (progressEvent.total) {
        downloadProgress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
      } else {
        downloadProgress = 100;
      }
      if (onProgress) {
        onProgress(downloadProgress);
      }
    },
  });
};

export const getSentencesByTranscriptionId = async (
  transcriptionId: string,
  onProgress?: (progress: number) => void,
) => {
  let downloadProgress = 0;

  return await assemblyAi.get<SentencesResponse>(
    `/transcript/${transcriptionId}/sentences`,
    {
      onDownloadProgress: progressEvent => {
        if (progressEvent.total) {
          downloadProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
        } else {
          downloadProgress = 100;
        }
        if (onProgress) {
          onProgress(downloadProgress);
        }
      },
    },
  );
};

// Function to get sentences by transcription ID

interface UploadResponse {
  upload_url: string;
}
