export const config = {
  port: 3000,
  rootPath: '/home/ubuntu/app/file-manager',
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
    image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'],
    document: ['pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf', 'odt'],
    html: ['html', 'htm'],
  },
  autoScan: {
    enabled: false,
    interval: 3600000,
  },
};
