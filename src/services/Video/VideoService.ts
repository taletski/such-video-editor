import { IVideoService, IVideo } from "./VideoService.types";
import mp4box from "mp4box";

export class VideoService {
  private static instance: VideoService | null = null;
  private readonly second = 1000;
  private readonly VIDEO_TRACK_INITIAL_LENGTH_MS = 10 * this.second;
  private readonly LENGTH_PX_PER_SECOND = 100;

  private constructor() {
    this.handleDropNewVideo = this.handleDropNewVideo.bind(this);
    this.handleMoveVideo = this.handleMoveVideo.bind(this);
  }

  private lengthPxFromTimeMs(ms: number) {
    return (ms / this.second) * this.LENGTH_PX_PER_SECOND;
  }

  private timeMsFromLengthPx(px: number) {
    return (px / this.LENGTH_PX_PER_SECOND) * this.second;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new VideoService();
    }
    return this.instance;
  }

  public async handleDropNewVideo(
    dropXStartCoordinateInTrackPx: number,
    file: File
  ) {
    if (file.type !== "video/mp4") return;

    const fileBuffer = await file.arrayBuffer();
    const fileArray = new Uint8Array(fileBuffer);

    // prepare the video element
    const video = document.createElement("video");
    document.body.appendChild(video);

    const media = new MediaSource();
    video.src = URL.createObjectURL(media);
    video.controls = true;

    media.addEventListener("sourceopen", function () {
      console.log("surs");
      const mediaSource = this;
      const buffer1 = mediaSource.addSourceBuffer(
        `video/mp4; codecs="avc1.4d002a, mp4a.40.2"`
      );

      console.log("media", mediaSource.sourceBuffers[0]);
      console.log("isOpen", mediaSource.readyState);

      buffer1.addEventListener("updateend", (e) => {
        // mediaSource.addEventListener("sourceopen", function () {
        //   console.log("open again!");
        //   this.endOfStream();
        //   video.play();
        // });

        console.log("burs");
        console.log("isOpen", mediaSource);
        console.log("isOpen", mediaSource.readyState);
        // const a = mediaSource.readyState;
        // mediaSource.endOfStream();
        // console.log(e.target);
      });

      console.log("file buffer", fileBuffer);
      buffer1.appendBuffer(fileBuffer);

      // console.log(mediaSource);
      // mediaSource.endOfStream();
      // console.log(mediaSource);
      // video.play();
    });

    // const buffer = fileBuffer as any;
    // buffer.fileStart = 0;

    // const mp4boxDroppedFile = mp4box.createFile();
    // mp4boxDroppedFile.onReady = console.log;
    // mp4boxDroppedFile.appendBuffer(buffer);
    // console.log("appended, flushing");
    // mp4boxDroppedFile.flush();
    // console.log("flushed");
  }

  public async handleMoveVideo(dropXStartCoordinateInTrackPx: number) {}
}
