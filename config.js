const FFMPEG_CONFIG = [
  "-profile:v baseline",
  "-fflags -nobuffer",
  "-fflags flush_packets",
  "-probesize 32",
  "-s 480x360",
  "-level 3.0",
  "-g 48",
  "-r 60",
  "-max_delay 0",
  "-start_number 0",
  "-hls_time 0",
  "-hls_list_size 0",
  "-f hls",
];

module.exports = {
  FFMPEG_CONFIG,
};
