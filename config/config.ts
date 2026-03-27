export const config = {
  port: 3000,
  rootPath: '/mnt/d/mCloudDownload',
  database: {
    path: './data/files.db',
  },
  logs: {
    path: './logs',
  },
  fileTypeMap: {
    media: {
      video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'],
      audio: ['mp3', 'ogg', 'wav', 'flac', 'aac', 'wma', 'm4a'],
    },
    document: ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf', 'odt'],
    html: ['html', 'htm'],
  },
};
