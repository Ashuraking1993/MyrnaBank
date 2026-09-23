import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  StatusBar,
} from "react-native";
import {
  useVideoPlayer,
  VideoView,
} from "expo-video";

type Props = {
  onFinish: () => void;
};

export default function IntroVideoScreen({
  onFinish,
}: Props) {
  const player = useVideoPlayer(
    require("../../assets/images/accenture-intro.mp4"),
    (player) => {
      player.loop = false;
      player.play();
    }
  );

  useEffect(() => {
    const subscription = player.addListener(
      "playToEnd",
      () => {
        onFinish();
      }
    );

    return () => {
      subscription.remove();
    };
  }, [player, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <VideoView
        player={player}
        style={styles.video}
        nativeControls={false}
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});