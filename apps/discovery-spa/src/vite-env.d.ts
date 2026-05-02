/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCOVERY_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
