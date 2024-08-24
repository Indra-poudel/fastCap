import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {
  BlendMode,
  SkTypefaceFontProvider,
  Skia,
} from '@shopify/react-native-skia';
import {useState, useRef, useEffect} from 'react';
import {InteractionManager} from 'react-native';
import uuid from 'react-native-uuid';
import {generateVideoFromFrames, saveFrame} from 'utils/video';
import {Template as TemplateState} from 'store/templates/type';
import {renderOffScreenTemplate} from 'offScreenComponents/offScreenTemplate';
import {GeneratedSentence} from 'utils/sentencesBuilder';
import {SharedValue} from 'react-native-reanimated';
import {ExportQuality} from 'store/videos/type';

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
  videoURL: string;
  template: TemplateState;
  paragraphLayoutWidth: SharedValue<number>;
  sentences: GeneratedSentence[];
  dragPercentageX: number;
  dragPercentageY: number;
  customFontManager: SkTypefaceFontProvider | null;
  scaleFactor: SharedValue<number>;
  quality: ExportQuality;
  duration: number;
  frameRate: number;
};

export const useExportService = ({
  width: _width,
  height: _height,
  template,
  sentences,
  paragraphLayoutWidth: _paragraphLayoutWidth,
  dragPercentageX,
  dragPercentageY,
  customFontManager,
  scaleFactor,
  quality,
  frameRate,
  duration,
  videoURL,
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
    const seekInterval = 1000 / frameRate;

    const totalFrames = Math.floor(duration / seekInterval);

    // Using InteractionManager to optimize the process
    InteractionManager.runAfterInteractions(async () => {
      for (let i = 0; i < totalFrames; i++) {
        if (!isMounted.current) {
          break;
        }

        const seekValue = i * seekInterval;

        await drawOffScreen(i, seekValue);

        const renderingProgress = ((i + 1) / totalFrames) * 100;

        setStepProgress(renderingProgress);
      }

      if (isMounted.current) {
        await generateAndSave();
      }
    });
  };

  const onProgress = (value: number) => {
    setStepProgress(value);
  };

  const generateAndSave = async () => {
    try {
      setCurrentStep(EXPORT_STEPS.EXPORTING);
      const videoPath = await generateVideoFromFrames(
        videoURL,
        duration,
        uuid.v4().toString(),
        frameRate.toString(),
        onProgress,
      );
      setStepProgress(100);

      CameraRoll.saveAsset(videoPath, {
        type: 'video',
      }).then(photoIdentifier => {
        console.log('Video path', videoPath);
        setGeneratedVideoInfo(photoIdentifier);
        setCurrentStep(EXPORT_STEPS.COMPLETE);
        setOverallStatus(OVER_ALL_PROCESS.COMPLETED);
      });
    } catch {
      setOverallStatus(OVER_ALL_PROCESS.ERROR);
    }
  };

  const drawOffScreen = async (index: number, seekValue: number) => {
    const imagePaint = Skia.Paint();
    imagePaint.setAntiAlias(true);
    imagePaint.setDither(true);
    imagePaint.setBlendMode(BlendMode.SrcOut);

    if (template) {
      const image = renderOffScreenTemplate(_width, _height, {
        currentTime: seekValue,
        sentences: sentences,
        paragraphLayoutWidth: _paragraphLayoutWidth,
        x: _width * (dragPercentageX / 100),
        y: _height * (dragPercentageY / 100),
        customFontMgr: customFontManager,
        ...template,
        fontSize: (template.fontSize * _width) / (_width * scaleFactor.value),
      });

      if (image) {
        await saveFrame(image, index).catch(errr => {
          console.log(errr);
        });
        image.dispose();
      }
    }
  };

  return {
    currentStep,
    stepProgress,
    overallStatus,
    generatedVideoInfo,
    startExportProcess,
  };
};
