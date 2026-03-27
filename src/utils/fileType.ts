import { config } from '../../config/config';

export function getFileType(extension: string): string | null {
  const ext = extension.toLowerCase();

  for (const [type, value] of Object.entries(config.fileTypeMap)) {
    if (Array.isArray(value)) {
      if ((value as string[]).includes(ext)) {
        return type;
      }
    } else {
      for (const subExtensions of Object.values(value as Record<string, string[]>)) {
        if (subExtensions.includes(ext)) {
          return type;
        }
      }
    }
  }

  return null;
}

export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    aac: 'audio/aac',
    wma: 'audio/x-ms-wma',
    m4a: 'audio/mp4',
    pdf: 'application/pdf',
    txt: 'text/plain',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    html: 'text/html',
    htm: 'text/html',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}
