/**
 * @file filesystem.d.ts
 * @description 이 파일은 File System Access API의 타입 정의를 포함합니다.
 *              이 API는 웹 애플리케이션이 사용자의 로컬 파일 시스템에 접근할 수 있도록 하며,
 *              파일을 읽고 쓰는 기능을 제공합니다.
 */

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
}

interface OpenFilePickerOptions {
  multiple?: boolean;
  types?: {
    description: string;
    accept: Record<string, string[]>;
  }[];
}

interface Window {
  showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
  showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
}
