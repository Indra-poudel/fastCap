import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

function withPageWrapper<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
) {
  const ComponentWithWrapper: React.FC<T> = props => {
    // const inset = useSafeAreaInsets();
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          //   {
          //     paddingTop: inset.top,
          //   },
        ]}>
        <WrappedComponent {...props} />
      </SafeAreaView>
    );
  };

  return ComponentWithWrapper;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default withPageWrapper;
