const fs = require("fs");
const path = require("path");
const hls = require("hls-server");
const cluster = require("cluster");
const express = require("express");
const ffmpeg = require("fluent-ffmpeg");
const { FFMPEG_CONFIG } = require("./config");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");

const playVideo = (link, mainFolder) => {
  if (cluster.isMaster) {
    cluster.fork();
    cluster.fork();
  } else {
    const app = express();

    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

    var headersSent = false;

    const server = app.listen(9000);

    if (
      !fs.existsSync(path.join(__dirname, mainFolder)) &&
      !fs.existsSync(path.join(__dirname, mainFolder, "videos"))
    ) {
      fs.mkdirSync(path.join(__dirname, mainFolder, "videos"), {
        recursive: true,
      });
    }

    ffmpeg(link, {
      timeout: 43200,
    })
      .addOptions(FFMPEG_CONFIG)
      .output(`${mainFolder}/videos/output.m3u8`)
      .on("progress", function () {
        fs.access(
          path.join(__dirname, mainFolder, "videos", "output.m3u8"),
          fs.constants.F_OK,
          function (err) {
            if (err) {
              console.log("file does not exists");
            } else {
              if (headersSent === false) {
                console.log("Processing success");
                console.log("File exists");

                //file exists
                console.log("==========");
                console.log("==========m3u8 file detected==========");
                console.log("==========");

                headersSent = true;
              }
            }
          }
        );
      })
      .on("end", () => {
        console.log("end");
      })
      .run();

    new hls(server, {
      provider: {
        exists: (req, cb) => {
          const ext = req.url.split(".").pop();
          if (ext !== "m3u8" && ext !== "ts") {
            return cb(null, false);
          }

          fs.access(
            path.join(__dirname, req.url),
            fs.constants.F_OK,
            function (err) {
              if (err) {
                console.log("HLS error");
                console.log("File not exist");
                return cb(null, false);
              }

              cb(null, true);
            }
          );
        },
        getManifestStream: (req, cb) => {
          const stream = fs.createReadStream(path.join(__dirname, req.url));
          cb(null, stream);
        },
        getSegmentStream: (req, cb) => {
          const stream = fs.createReadStream(path.join(__dirname, req.url));
          cb(null, stream);
        },
      },
    });
  }
};

module.exports = {
  playVideo: playVideo,
};
