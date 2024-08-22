import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {
  SkImage,
  SkTypefaceFontProvider,
  Skia,
  Video,
} from '@shopify/react-native-skia';
import {useState, useRef, useEffect} from 'react';
import {InteractionManager} from 'react-native';
import uuid from 'react-native-uuid';
import {generateVideoFromFrames, saveFrame} from 'utils/video';
import {Template as TemplateState} from 'store/templates/type';
import {renderOffScreenTemplate} from 'offScreenComponents/offScreenTemplate';
import {GeneratedSentence} from 'utils/sentencesBuilder';
import {SharedValue} from 'react-native-reanimated';

export enum EXPORT_STEPS {
  RENDER_FRAMES = '🖼️ Rendering Frames',
  EXPORTING = '💾 Exporting...',
  COMPLETE = '✅ Export Complete',
}

export enum OVER_ALL_PROCESS {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export type ExportServiceProps = {
  width: number;
  height: number;
  audioURL: string;
  template: TemplateState;
  paragraphLayoutWidth: SharedValue<number>;
  sentences: GeneratedSentence[];
  dragPercentageX: number;
  dragPercentageY: number;
  customFontManager: SkTypefaceFontProvider | null;
  scaleFactor: SharedValue<number>;
  video: Video;
};

export const useExportService = ({
  width,
  height,
  audioURL,
  template,
  sentences,
  paragraphLayoutWidth,
  dragPercentageX,
  dragPercentageY,
  customFontManager,
  scaleFactor,
  video,
}: ExportServiceProps) => {
  const [currentStep, setCurrentStep] = useState(EXPORT_STEPS.RENDER_FRAMES);
  const [overallStatus, setOverallStatus] = useState(
    OVER_ALL_PROCESS.PROCESSING,
  );
  const [stepProgress, setStepProgress] = useState(0);
  const [generatedVideoInfo, setGeneratedVideoInfo] = useState<
    PhotoIdentifier | undefined
  >(undefined);

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const startExportProcess = async () => {
    video.setVolume(0);

    const duration = video.duration();

    const frameRate = video.framerate();
    const seekInterval = 1000 / frameRate;
    const totalDuration = video.duration();

    const totalFrames = Math.floor(totalDuration / seekInterval);

    // Using InteractionManager to optimize the process
    InteractionManager.runAfterInteractions(async () => {
      for (let i = 0; i < totalFrames; i++) {
        if (!isMounted.current) {
          break;
        }

        const seekValue = i * seekInterval;

        video.seek(seekValue);

        const currentImage = video.nextImage();

        if (currentImage) {
          await drawOffScreen(i, currentImage, seekValue);

          const renderingProgress = ((i + 1) / totalFrames) * 100;

          setStepProgress(renderingProgress);
        }
      }

      if (isMounted.current) {
        await generateAndSave(duration);
      }
    });
  };

  const onProgress = (value: number) => {
    setStepProgress(value);
  };

  const generateAndSave = async (duration: number) => {
    try {
      setCurrentStep(EXPORT_STEPS.EXPORTING);
      const videoPath = await generateVideoFromFrames(
        audioURL,
        duration,
        uuid.v4().toString(),
        onProgress,
      );
      setStepProgress(100);

      console.log('VIDEO_PATH', videoPath);

      CameraRoll.saveAsset(videoPath, {
        type: 'video',
      }).then(photoIdentifier => {
        setGeneratedVideoInfo(photoIdentifier);
        setCurrentStep(EXPORT_STEPS.COMPLETE);
        setOverallStatus(OVER_ALL_PROCESS.COMPLETED);
      });
    } catch {
      setOverallStatus(OVER_ALL_PROCESS.ERROR);
    }
  };

  const drawOffScreen = async (
    index: number,
    imageToDraw: SkImage,
    seekValue: number,
  ) => {
    const offScreen = Skia.Surface.MakeOffscreen(width, height);

    if (!offScreen) {
      return;
    }

    const canvas = offScreen.getCanvas();

    const image = imageToDraw.makeNonTextureImage();

    const imagePaint = Skia.Paint();
    imagePaint.setAntiAlias(true);
    imagePaint.setDither(true);

    canvas.drawImage(image, 0, 0, imagePaint);

    if (template) {
      renderOffScreenTemplate(canvas, {
        currentTime: seekValue,
        sentences: sentences,
        paragraphLayoutWidth: paragraphLayoutWidth,
        x: width * (dragPercentageX / 100),
        y: height * (dragPercentageY / 100),
        customFontMgr: customFontManager,
        ...template,
        fontSize: template.fontSize * (width / (width * scaleFactor.value)),
      });
    }

    offScreen.flush();

    const img = offScreen.makeImageSnapshot();
    await saveFrame(img, index).catch(errr => {
      console.log(errr);
    });
    canvas.clear(Skia.Color('transparent'));
    img.dispose();
    offScreen.dispose();
  };

  return {
    currentStep,
    stepProgress,
    overallStatus,
    generatedVideoInfo,
    startExportProcess,
  };
};
