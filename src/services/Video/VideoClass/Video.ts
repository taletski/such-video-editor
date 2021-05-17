import inRange from "lodash.inrange";
import { IVideo } from "../VideoService.types";

export class Video implements IVideo {
  private VIDEO_DEFAULT_ASPECT_RATIO = 16 / 9;
  private static lastDateUsedToGenerateUniqueId: number | null = null;
  private videoId: string | null = null;
  private videoSrc: string | null = null;
  private pxPerSecond: number | null = null;
  private previewFrameWidthPx: number | null = null;
  private previewFrameEveryMs: number | null = null;
  private dropXStartCoordinateInTrackPx: number | null = null;
  private videoStart_ms: number | null = null;
  private videoEnd_ms: number | null = null;
  private videoDuration_ms: number | null = null;
  private framesUrls: Array<string> = [];

  public constructor(
    dropXStartCoordinateInTrackPx: number,
    file: File,
    config: {
      pxPerSecond: number;
      previewFrameWidthPx: number;
      previewFrameEveryMs: number;
    }
  ) {
    this.videoId = Video.generateUniqueId();
    this.videoSrc = URL.createObjectURL(file);
    this.pxPerSecond = config.pxPerSecond;
    this.previewFrameWidthPx = config.previewFrameWidthPx;
    this.previewFrameEveryMs = config.previewFrameEveryMs;
    this.videoStart_ms = this.pxToMs(dropXStartCoordinateInTrackPx);
    this.dropXStartCoordinateInTrackPx = dropXStartCoordinateInTrackPx;

    this.applyOffsetMs = this.applyOffsetMs.bind(this);
    this.applyOffsetPx = this.applyOffsetPx.bind(this);
  }

  private static generateUniqueId() {
    const time = Date.now();
    const last = Video.lastDateUsedToGenerateUniqueId || time;
    Video.lastDateUsedToGenerateUniqueId = time > last ? time : last + 1;
    return (Video.lastDateUsedToGenerateUniqueId + Math.random()).toString(32);
  }

  private pxToMs(px: number) {
    if (this.pxPerSecond === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return (px / this.pxPerSecond) * 1000;
  }

  private msToPx(ms: number) {
    if (this.pxPerSecond === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return (ms / 1000) * this.pxPerSecond;
  }

  private async extractFramesFromVideo() {
    if (
      this.videoSrc === null ||
      this.pxPerSecond === null ||
      this.previewFrameWidthPx === null ||
      this.previewFrameEveryMs === null
    )
      throw new Error("Fatal: can not extract the video preview frames");

    const extractedFrames: Array<string> = [];
    const video = document.createElement("video");
    video.src = this.videoSrc;

    const canvas = document.createElement("canvas");
    canvas.width = this.previewFrameWidthPx;
    canvas.height = this.previewFrameWidthPx / this.VIDEO_DEFAULT_ASPECT_RATIO;

    const canvasContext = canvas.getContext("2d");

    await new Promise<void>((resolve) => {
      video.addEventListener("loadeddata", async () => {
        const videoDuration = video.duration;

        if (isNaN(videoDuration)) {
          throw new Error(
            "VideoClassError: attemted to extract frames but failed to get duration of the video."
          );
        }

        let videoSeekTime = 0;
        let unblockSeeking: () => void = () => {};

        const blockSeeking = () => {
          return new Promise<void>((resolve) => {
            unblockSeeking = resolve;
          });
        };

        const seekNextFrame = async () => {
          video.currentTime = videoSeekTime;
          videoSeekTime += (this.previewFrameEveryMs as number) / 1000;
          await blockSeeking();
        };

        const captureFrame = () => {
          canvasContext?.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            extractedFrames.push(window.webkitURL.createObjectURL(blob));
          });
          unblockSeeking && unblockSeeking();
        };

        video.addEventListener("seeked", captureFrame);
        while (videoSeekTime < videoDuration) {
          await seekNextFrame();
        }

        resolve();
      });
    });

    return extractedFrames;
  }

  public async processFile() {
    if (
      this.videoSrc === null ||
      this.pxPerSecond === null ||
      this.videoStart_ms === null
    )
      throw new Error("Fatal: can not process the video file");

    const video = document.createElement("video");
    video.src = this.videoSrc;

    await new Promise<Event>((resolve) => {
      video.addEventListener("loadeddata", resolve);
    });
    this.videoDuration_ms = video.duration * 1000;
    this.videoEnd_ms = this.videoStart_ms + this.videoDuration_ms;

    this.framesUrls = await this.extractFramesFromVideo();
  }

  public applyOffsetMs(ms: number) {
    if (this.videoStart_ms === null || this.videoEnd_ms === null)
      throw new Error("Video is not processed. Run processFile method first.");
    this.videoStart_ms += ms;
    this.videoEnd_ms += ms;
  }

  public applyOffsetPx(px: number) {
    this.applyOffsetMs(this.pxToMs(px));
  }

  public overlapsWith(video: IVideo) {
    if (this.videoStart_ms === null || this.videoEnd_ms === null)
      throw new Error("Video is not processed. Run processFile method first.");
    const [shortestVideo, longestVideo] = (this.duration_ms <= video.duration_ms
      ? [this, video]
      : [video, this]) as [IVideo, IVideo];

    const overlaps =
      inRange(
        shortestVideo.start_ms,
        longestVideo.start_ms,
        longestVideo.end_ms
      ) ||
      inRange(shortestVideo.end_ms, longestVideo.start_ms, longestVideo.end_ms);

    return overlaps;
  }

  public get id() {
    if (!this.videoId)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.videoId;
  }

  public get src() {
    if (!this.videoSrc)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.videoSrc;
  }

  public get framesSrcs() {
    return this.framesUrls;
  }

  public get start_ms() {
    if (this.videoStart_ms === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.videoStart_ms;
  }

  public get end_ms() {
    if (this.videoEnd_ms === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.videoEnd_ms;
  }

  public get duration_ms() {
    if (this.videoDuration_ms === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.videoDuration_ms;
  }

  public get frames_start_px() {
    if (this.videoStart_ms === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.msToPx(this.videoStart_ms);
  }

  public get frames_end_px() {
    if (this.videoEnd_ms === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.msToPx(this.videoEnd_ms);
  }

  public get length_px() {
    if (this.videoDuration_ms === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.msToPx(this.videoDuration_ms);
  }

  public get preview_frames_width_px() {
    if (this.previewFrameWidthPx === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.previewFrameWidthPx;
  }

  public get preview_height_width_px() {
    if (this.previewFrameWidthPx === null)
      throw new Error("Video is not processed. Run processFile method first.");
    return this.previewFrameWidthPx / this.VIDEO_DEFAULT_ASPECT_RATIO;
  }
}
