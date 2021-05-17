import { cloneDeep } from "lodash";
import { Video } from "./VideoClass/Video";
import {
  IVideoService,
  TSeIVideoProgressPositionPx,
  IVideo,
  IVideoTrackState,
  TSetTrackState,
  TSetIsPlayingTrack,
} from "./VideoService.types";

export class VideoServiceDummyImpl implements IVideoService {
  private readonly MS_IN_A_SECOND = 1000;
  private readonly LENGTH_PX_PER_SECOND = 100;
  private readonly VIDEO_FRAME_PREVIEW_WIDTH_PX = 25;
  private readonly VIDEO_TRACK_INITIAL_DURATION_LENGTH_MS =
    100 * this.MS_IN_A_SECOND;
  private readonly VIDEO_TRACK_INITIAL_LENGTH_PX = this.lengthPxFromTimeMs(
    this.VIDEO_TRACK_INITIAL_DURATION_LENGTH_MS
  );
  private readonly VIDEO_PREVIEW_FRAME_EVERY_MS = this.timeMsFromLengthPx(
    this.VIDEO_FRAME_PREVIEW_WIDTH_PX
  );
  private static instance: IVideoService | null = null;
  private isPlayingTrack: boolean = false;
  private currentTrackTimeMs: number = 0;
  private cancelPlayingTrackPromiseLoop: (() => void) | null = null;
  private videoContainerElement: HTMLElement | null = null;
  private videoHideMask: HTMLDivElement | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private videoProgressPositionPx: number = 0;
  private videoProgressPositionUpdateInterval: number | null = null;
  private videoTrackLengthPx: number = this.lengthPxFromTimeMs(
    this.VIDEO_TRACK_INITIAL_DURATION_LENGTH_MS
  );
  private videoTrackState: IVideoTrackState = {
    items: [],
    length_px: this.VIDEO_TRACK_INITIAL_LENGTH_PX,
  };
  private subscribersOnVideoProgressPositionPx: Set<TSeIVideoProgressPositionPx> = new Set();
  private subscribersOnTrackState: Set<TSetTrackState> = new Set();
  private subscribersOnIsPlayingTrack: Set<TSetIsPlayingTrack> = new Set();

  private constructor() {
    this.connect = this.connect.bind(this);
    this.playTrack = this.playTrack.bind(this);
    this.stopResetTrack = this.stopResetTrack.bind(this);
    this.handleDropNewVideo = this.handleDropNewVideo.bind(this);
    this.handleMoveVideo = this.handleMoveVideo.bind(this);
    this.subscribeOnTrackState = this.subscribeOnTrackState.bind(this);
    this.unsubscribeFromTrackState = this.unsubscribeFromTrackState.bind(this);
    this.subscribeOnIsPlayingTrack = this.subscribeOnIsPlayingTrack.bind(this);
    this.unsubscribeFromIsPlayingTrack = this.unsubscribeFromIsPlayingTrack.bind(
      this
    );
    this.subscribeOnVideoProgressBarPositionPx = this.subscribeOnVideoProgressBarPositionPx.bind(
      this
    );
    this.unsubscribeFromVideoProgressBarPositionPx = this.unsubscribeFromVideoProgressBarPositionPx.bind(
      this
    );
  }

  // helpers

  private lengthPxFromTimeMs(ms: number) {
    return (ms / this.MS_IN_A_SECOND) * this.LENGTH_PX_PER_SECOND;
  }

  private timeMsFromLengthPx(px: number) {
    return (px / this.LENGTH_PX_PER_SECOND) * this.MS_IN_A_SECOND;
  }

  // observers notificators

  private notifyThatVideoProgressPositionPxChanged() {
    this.subscribersOnVideoProgressPositionPx.forEach((setPosition) =>
      setPosition(this.videoProgressPositionPx)
    );
  }

  private notifyThatTrackStateChanged() {
    this.subscribersOnTrackState.forEach((setTrackState) =>
      setTrackState(cloneDeep(this.videoTrackState))
    );
  }

  private notifyThatIsPlayingTrackChanged() {
    this.subscribersOnIsPlayingTrack.forEach((setIsPlayingTrack) =>
      setIsPlayingTrack(this.isPlayingTrack)
    );
  }

  // Methods for controlling the video progress indicator

  private moveVideoProgressPosition(movePx: number) {
    if (this.checkIsVideoProgressPositionPxAboveBoundary(movePx)) {
      throw new Error(
        "VideoServiceInternalError: attempted to move progress bar further than it is possible."
      );
    }
    this.videoProgressPositionPx += movePx;
    this.notifyThatVideoProgressPositionPxChanged();
  }

  private reseIVideoProgressPosition() {
    this.videoProgressPositionPx = 0;
    this.notifyThatVideoProgressPositionPxChanged();
  }

  private checkIsVideoProgressPositionPxAboveBoundary(
    positionOffsetPx: number = 0
  ) {
    return (
      this.videoProgressPositionPx + positionOffsetPx > this.videoTrackLengthPx
    );
  }

  private startMovingVideoProgressPosition(updateRateHz: number = 60) {
    const updateEvery = this.MS_IN_A_SECOND / updateRateHz;
    const updateMovePx = this.lengthPxFromTimeMs(updateEvery);

    this.videoProgressPositionUpdateInterval = window.setInterval(() => {
      if (this.checkIsVideoProgressPositionPxAboveBoundary(updateMovePx)) {
        this.stopResetMovingVideoProgressPosition();
      }
      this.moveVideoProgressPosition(updateMovePx);
    }, updateEvery);
  }

  private stopMovingVideoProgressPosition() {
    this.videoProgressPositionUpdateInterval &&
      window.clearInterval(this.videoProgressPositionUpdateInterval);
    this.videoProgressPositionUpdateInterval = null;
  }

  private stopResetMovingVideoProgressPosition() {
    this.stopMovingVideoProgressPosition();
    this.reseIVideoProgressPosition();
  }

  // methods for handling video track

  private videoCanFitInTrackBounds(video: IVideo) {
    return video.duration_ms < this.VIDEO_TRACK_INITIAL_DURATION_LENGTH_MS;
  }

  private handleVideoEdgeOutOfTrackBounds(video: IVideo) {
    const dropXEndCoordinateInTrackPx =
      video.frames_start_px +
      (video.duration_ms / this.MS_IN_A_SECOND) * this.LENGTH_PX_PER_SECOND;

    const xStartCoordinateOffset = video.frames_start_px;
    const xEndCoordinateOffset =
      dropXEndCoordinateInTrackPx - this.VIDEO_TRACK_INITIAL_LENGTH_PX;
    if (xStartCoordinateOffset < 0) {
      video.applyOffsetMs(-this.timeMsFromLengthPx(xStartCoordinateOffset));
    } else if (xEndCoordinateOffset > 0) {
      video.applyOffsetMs(-this.timeMsFromLengthPx(xEndCoordinateOffset));
    }

    return video;
  }

  private async addVideoToTrack(
    dropXStartCoordinateInTrackPx: number,
    file: File
  ) {
    let video = new Video(dropXStartCoordinateInTrackPx, file, {
      pxPerSecond: this.LENGTH_PX_PER_SECOND,
      previewFrameWidthPx: this.VIDEO_FRAME_PREVIEW_WIDTH_PX,
      previewFrameEveryMs: this.VIDEO_PREVIEW_FRAME_EVERY_MS,
    });

    await video.processFile();
    if (!this.videoFitsIn(video)) return;
    this.videoTrackState.items.push(video);
    this.notifyThatTrackStateChanged();
  }

  private videoFitsIn(video: IVideo) {
    if (!this.videoCanFitInTrackBounds(video)) {
      console.warn(
        "Can not add/move video because it is larger than the track size"
      );
      return false;
    }

    this.handleVideoEdgeOutOfTrackBounds(video);
    const collisionFound = this.videoTrackState.items.some(
      (videoInTrack) =>
        videoInTrack !== video && video.overlapsWith(videoInTrack)
    );
    if (collisionFound) {
      console.warn("Can not add/move video because it collides with others");
      return false;
    }

    return true;
  }

  // render for the preview

  private generatePlaylist() {
    const playlist = [];
    const videosListSorted = this.videoTrackState.items.sort(
      (a, b) => a.start_ms - b.start_ms
    );
    const firstVideoIdx = 0;
    const lastVideoIdx = videosListSorted.length && videosListSorted.length - 1;

    const initialDelay =
      videosListSorted[firstVideoIdx]?.start_ms ||
      this.timeMsFromLengthPx(this.videoTrackLengthPx);
    playlist.push(initialDelay);

    videosListSorted.forEach((video, idx, videos) => {
      const videoElement = document.createElement("video");
      videoElement.src = video.src;
      playlist.push(videoElement);
      if (idx !== lastVideoIdx) {
        const nextVideo = videos[idx + 1];
        const delay = nextVideo.start_ms - video.end_ms;
        if (delay > 0) playlist.push(delay);
      }
    });

    if (lastVideoIdx) {
      const lastVideo = videosListSorted[lastVideoIdx];
      const finalDelay =
        this.timeMsFromLengthPx(this.videoTrackLengthPx) - lastVideo.end_ms;
      finalDelay && playlist.push(finalDelay);
    }

    return playlist as Array<number | HTMLVideoElement>;
  }

  private replaceVideo(newVideo: HTMLVideoElement) {
    this.videoElement &&
      this.videoContainerElement?.removeChild(this.videoElement);
    this.videoElement = newVideo;
    this.videoContainerElement?.appendChild(this.videoElement);
  }

  // video synchronization monkey-coding hacks

  private applyVideoHideMask() {
    if (this.videoHideMask) {
      return;
    }
    const mask = document.createElement("div");
    this.videoHideMask = mask;
    this.videoHideMask.style.height = "100%";
    this.videoHideMask.style.width = "100%";
    this.videoHideMask.style.backgroundColor = "black";
    this.videoHideMask.style.position = "absolute";
    this.videoContainerElement?.appendChild(this.videoHideMask);
  }

  private removeVideoHideMask() {
    this.videoHideMask &&
      this.videoContainerElement?.removeChild(this.videoHideMask);
    this.videoHideMask = null;
  }

  private getVideoOrWaitDelayCorrectionMs() {
    const delayCorrection =
      this.currentTrackTimeMs -
      this.timeMsFromLengthPx(this.videoProgressPositionPx);
    const delayCorrectionPositiveClipped =
      delayCorrection < 0 ? delayCorrection : 0;

    return delayCorrectionPositiveClipped;
  }

  private getCorrectedVideoOrWaitDelay(delayMs: number) {
    const correction = this.getVideoOrWaitDelayCorrectionMs();
    let corrected = delayMs + correction;
    return corrected > 0 ? corrected : 0;
  }

  // video progress high-level controls

  private startPlayingTrack() {
    this.isPlayingTrack = true;
    this.notifyThatIsPlayingTrackChanged();
    this.startMovingVideoProgressPosition();
  }

  private stopPlayingTrackResetProgress() {
    if (this.videoElement) {
      this.videoElement.src = "";
    }
    this.isPlayingTrack = false;
    this.currentTrackTimeMs = 0;
    this.cancelPlayingTrackPromiseLoop && this.cancelPlayingTrackPromiseLoop();
    this.notifyThatIsPlayingTrackChanged();
    this.stopResetMovingVideoProgressPosition();
  }

  // public API

  public static getInstance() {
    if (!this.instance) {
      this.instance = new VideoServiceDummyImpl();
    }
    return this.instance;
  }

  public async connect(container: HTMLDivElement) {
    this.videoContainerElement = container;
    this.applyVideoHideMask();
  }

  public async playTrack() {
    const playlist = this.generatePlaylist();
    this.startPlayingTrack();
    debugger;

    for (const [i, element] of Object.entries(playlist)) {
      if (!this.isPlayingTrack) break;
      const idx = Number(i);
      switch (typeof element) {
        case "number":
          const delayDuration = this.getCorrectedVideoOrWaitDelay(element);
          const delay = new Promise<void>((resolve) => {
            const timeout = setTimeout(resolve, delayDuration);
            const cancelPlaying = () => {
              clearTimeout(timeout);
              resolve();
            };
            this.cancelPlayingTrackPromiseLoop = cancelPlaying;
          });
          const nextElement = idx < playlist.length - 1 && playlist[idx + 1];
          if (nextElement && typeof nextElement === "object") {
            this.applyVideoHideMask();
            this.replaceVideo(nextElement);
          }
          await delay;
          if (!this.isPlayingTrack) break;
          this.currentTrackTimeMs += element;
          this.videoElement?.play();
          this.removeVideoHideMask();
          break;
        case "object":
          const player = this.videoElement;
          const videoDuration = element.duration * 1000;
          player &&
            (await new Promise<void>((resolve) => {
              const goNextAfterMs = this.getCorrectedVideoOrWaitDelay(
                videoDuration
              );
              const stopPlaying = () => {
                player.src = "";
                resolve();
              };
              const timeout = setTimeout(stopPlaying, goNextAfterMs);
              this.cancelPlayingTrackPromiseLoop = () => {
                clearTimeout(timeout);
                stopPlaying();
              };
            }));
          this.currentTrackTimeMs += videoDuration;
          break;
      }
    }
    this.stopPlayingTrackResetProgress();
  }

  public async stopResetTrack() {
    this.stopPlayingTrackResetProgress();
  }

  public async handleDropNewVideo(
    dropXStartCoordinateInTrackPx: number,
    file: File
  ) {
    if (file?.type !== "video/mp4") return;
    await this.addVideoToTrack(dropXStartCoordinateInTrackPx, file);
  }

  public async handleMoveVideo(
    dropXStartCoordinateInTrackPx: number,
    videoId: string
  ) {
    const video = this.videoTrackState.items.find(
      (trackVideo) => trackVideo.id === videoId
    );
    if (!video) {
      throw new Error("Wow that's so strange. How could that happen?");
    }

    const moveXOffset = dropXStartCoordinateInTrackPx - video.frames_start_px;
    video.applyOffsetPx(moveXOffset);

    if (!this.videoFitsIn(video)) {
      video.applyOffsetPx(-moveXOffset);
      return;
    }

    this.notifyThatTrackStateChanged();
  }

  public subscribeOnVideoProgressBarPositionPx(
    setter: TSeIVideoProgressPositionPx
  ) {
    this.subscribersOnVideoProgressPositionPx.add(setter);
  }

  public unsubscribeFromVideoProgressBarPositionPx(
    setter: TSeIVideoProgressPositionPx
  ) {
    this.subscribersOnVideoProgressPositionPx.delete(setter);
  }

  public subscribeOnTrackState(setter: TSetTrackState) {
    this.subscribersOnTrackState.add(setter);
  }

  public unsubscribeFromTrackState(setter: TSetTrackState) {
    this.subscribersOnTrackState.delete(setter);
  }

  public subscribeOnIsPlayingTrack(setter: TSetIsPlayingTrack) {
    this.subscribersOnIsPlayingTrack.add(setter);
  }

  public unsubscribeFromIsPlayingTrack(setter: TSetIsPlayingTrack) {
    this.subscribersOnIsPlayingTrack.delete(setter);
  }

  public get initialTrackLengthPx() {
    return this.VIDEO_TRACK_INITIAL_LENGTH_PX;
  }
}
