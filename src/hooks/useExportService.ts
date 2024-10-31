import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {
  BlendMode,
  SkTypefaceFontProvider,
  Skia,
  rect,
} from '@shopify/react-native-skia';
import {useState, useRef, useEffect, useMemo} from 'react';
import {InteractionManager, useWindowDimensions} from 'react-native';
import {generateVideoFromFrames, saveFrame} from 'utils/video';
import {Template as TemplateState} from 'store/templates/type';
import {renderOffScreenTemplate} from 'offScreenComponents/offScreenTemplate';
import {GeneratedSentence} from 'utils/sentencesBuilder';
import {SharedValue} from 'react-native-reanimated';
import {ExportQuality} from 'store/videos/type';
import {deleteVideoFramesDirectory} from 'utils/directory';
import {getTransformedBoundingBox} from 'utils/transform';

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
  videoId: string;
  scale: SharedValue<number>;
  rotation: SharedValue<number>;
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
  frameRate,
  duration,
  videoURL,
  videoId,
  scale,
  rotation,
}: ExportServiceProps) => {
  const [currentStep, setCurrentStep] = useState(EXPORT_STEPS.RENDER_FRAMES);
  const [overallStatus, setOverallStatus] = useState(
    OVER_ALL_PROCESS.PROCESSING,
  );
  const [stepProgress, setStepProgress] = useState(0);
  const [generatedVideoPath, setGeneratedVideoPath] = useState<
    string | undefined
  >(undefined);

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const {height, width} = useWindowDimensions();

  const startExportProcess = async () => {
    const seekInterval = 1000 / frameRate;
    const totalFrames = Math.floor(duration / seekInterval);
    const bulkSize = 5;

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
        videoId,
        frameRate.toString(),
        x,
        y,
        onProgress,
      );
      setStepProgress(100);

      console.log('output', videoPath);

      CameraRoll.saveAsset(videoPath, {
        type: 'video',
        album: 'FastCap',
      }).then(async () => {
        await deleteVideoFramesDirectory(videoId);
        setGeneratedVideoPath(videoPath);
        setCurrentStep(EXPORT_STEPS.COMPLETE);
        setOverallStatus(OVER_ALL_PROCESS.COMPLETED);
      });
    } catch {
      setOverallStatus(OVER_ALL_PROCESS.ERROR);
    }
  };

  const scaleX = useMemo(() => {
    return _width / width;
  }, [_width, width]);

  const scaleY = useMemo(() => {
    return _height / height;
  }, [_height, height]);

  const drawOffScreen = async (index: number, seekValue: number) => {
    const {image, x, y, height} = renderOffScreenTemplate(
      _width,
      _height,
      scaleX,
      scaleY,
      {
        currentTime: seekValue,
        sentences: sentences,
        paragraphLayoutWidth: _paragraphLayoutWidth,
        x: _width * (dragPercentageX / 100),
        y: _height * (dragPercentageY / 100),
        customFontMgr: customFontManager,
        ...template,
        fontSize: template.fontSize * scaleX,
        scale: scale,
        rotation: rotation,
      },
    );

    const {newY, newHeight} = getTransformedBoundingBox(
      x,
      y,
      _width,
      height,
      scale.value,
      rotation.value,
    );

    const imagePaint = Skia.Paint();
    imagePaint.setAntiAlias(true);
    imagePaint.setDither(true);
    imagePaint.setBlendMode(BlendMode.SrcOut);

    const offScreen = Skia.Surface.MakeOffscreen(_width, newHeight);

    if (!offScreen) {
      return;
    }

    const canvas = offScreen.getCanvas();
    const src = rect(0, newY, _width, newHeight);
    const dst = rect(0, 0, _width, newHeight);

    if (image) {
      canvas.drawImageRect(image, src, dst, imagePaint);

      offScreen.flush();

      const canvaImage = offScreen.makeImageSnapshot();

      await saveFrame(canvaImage, index, videoId).catch(errr => {
        console.log(errr);
      });
      image.dispose();
    }

    return {x: 0, y: newY};
  };

  return {
    currentStep,
    stepProgress,
    overallStatus,
    generatedVideoPath,
    startExportProcess,
  };
};
