import BottomSheet from 'components/BottomSheet';
import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import {WebViewProps} from 'react-native-webview';

type FastCapWebViewProps = {
  label: string;
  uri: string;
  onClose: () => void;
} & WebViewProps;

const FastCapWebView = ({
  label,
  uri,
  onClose,
  ...webViewProps
}: FastCapWebViewProps) => {
  return (
    <BottomSheet
      showCloseIcon
      label={label}
      onClose={onClose}
      {...webViewProps}
      initialHeightPercentage={90}>
      <View style={Styles.webViewContainer}>
        <WebView
          style={Styles.webView}
          startInLoadingState={true}
          source={{uri}}
          renderLoading={() => (
            <View style={Styles.activityContainer}>
              <ActivityIndicator size={'large'} />
            </View>
          )}
        />
      </View>
    </BottomSheet>
  );
};

const Styles = StyleSheet.create({
  webViewContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },

  webView: {
    flex: 1,
  },
  activityContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
});

export default FastCapWebView;
