import Animated, {
  SharedValue,
  isSharedValue,
  useSharedValue,
} from 'react-native-reanimated';

type Animated<T> = SharedValue<T> | T;

export const useOption = <T>(value: Animated<T>) => {
  'worklet';
  // TODO: only create defaultValue is needed (via makeMutable)
  const defaultValue = useSharedValue(
    isSharedValue(value) ? value.value : value,
  );
  return isSharedValue(value) ? value : defaultValue;
};
