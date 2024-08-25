import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {
  BlendMode,
  SkTypefaceFontProvider,
  Skia,
  rect,
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
  customFontManager: SkTypefaceFontProvider;
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
    const bulkSize = 5; // Number of frames processed concurrently, you can adjust this value

    let position = {
      x: 0,
      y: 0,
    };

    // Using InteractionManager to optimize the process
    InteractionManager.runAfterInteractions(async () => {
      for (let i = 0; i < totalFrames; i += bulkSize) {
        if (!isMounted.current) {
          break;
        }

        const bulkPromises = [];
        for (let j = 0; j < bulkSize && i + j < totalFrames; j++) {
          const seekValue = (i + j) * seekInterval;
          bulkPromises.push(drawOffScreen(i + j, seekValue));
        }

        // Wait for all promises in the bulk to complete
        const [pos] = await Promise.all(bulkPromises);

        position = {
          x: 0,
          y: pos?.y || 0,
        };

        const renderingProgress = ((i + bulkSize) / totalFrames) * 100;
        setStepProgress(renderingProgress);
      }

      if (isMounted.current) {
        await generateAndSave(position.x, position.y);
      }
    });
  };

  const onProgress = (value: number) => {
    setStepProgress(value);
  };

  const generateAndSave = async (x: number, y: number) => {
    try {
      setCurrentStep(EXPORT_STEPS.EXPORTING);
      const videoPath = await generateVideoFromFrames(
        videoURL,
        duration,
        uuid.v4().toString(),
        frameRate.toString(),
        x,
        y,
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
    const {image, x, y, height} = renderOffScreenTemplate(_width, _height, {
      currentTime: seekValue,
      sentences: sentences,
      paragraphLayoutWidth: _paragraphLayoutWidth,
      x: _width * (dragPercentageX / 100),
      y: _height * (dragPercentageY / 100),
      customFontMgr: customFontManager,
      ...template,
      fontSize: (template.fontSize * _width) / (_width * scaleFactor.value),
    });

    console.log(y);

    const imagePaint = Skia.Paint();
    imagePaint.setAntiAlias(true);
    imagePaint.setDither(true);
    imagePaint.setBlendMode(BlendMode.SrcOut);

    const offScreen = Skia.Surface.MakeOffscreen(_width, height);

    if (!offScreen) {
      return;
    }

    const canvas = offScreen.getCanvas();

    const src = rect(0, y, _width, height);
    const dst = rect(0, 0, _width, height);

    if (image) {
      canvas.drawImageRect(image, src, dst, imagePaint, false);

      offScreen.flush();

      const canvaImage = offScreen.makeImageSnapshot();

      await saveFrame(canvaImage, index).catch(errr => {
        console.log(errr);
      });
      image.dispose();
    }

    return {x, y};
  };

  return {
    currentStep,
    stepProgress,
    overallStatus,
    generatedVideoInfo,
    startExportProcess,
  };
};
