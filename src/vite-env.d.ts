/// <reference types="vite/client" />

// Shims per evitare errori di tipo su moduli Tauri in ambienti web/build
declare module '@tauri-apps/api/core';
declare module '@tauri-apps/plugin-dialog' {
  export interface SaveDialogOptions {
    defaultPath?: string;
    title?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }
  export function save(options?: SaveDialogOptions): Promise<string | null>;
}
declare module '@tauri-apps/plugin-fs' {
  export function writeFile(path: string, contents: Uint8Array | string): Promise<void>;
}