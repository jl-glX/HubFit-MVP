export type DownloadPlatform = "windows" | "android" | "macos" | "ios" | "zip";

export interface DownloadOption {
  id: DownloadPlatform;
  name: string;
  destination: string;
  url: string | null;
  available: boolean;
  packageFormat: string;
}

const downloadConfiguration: Array<{
  id: DownloadPlatform;
  name: string;
  destination: string;
  environmentVariable: string;
  packageFormat: string;
}> = [
  {
    id: "windows",
    name: "Windows",
    destination: "Microsoft Store",
    environmentVariable: "DOWNLOAD_WINDOWS_URL",
    packageFormat: "Store app",
  },
  {
    id: "android",
    name: "Android",
    destination: "Google Play",
    environmentVariable: "DOWNLOAD_ANDROID_URL",
    packageFormat: "Store app",
  },
  {
    id: "macos",
    name: "macOS",
    destination: "Mac App Store",
    environmentVariable: "DOWNLOAD_MACOS_URL",
    packageFormat: "Store app",
  },
  {
    id: "ios",
    name: "iPhone and iPad",
    destination: "App Store",
    environmentVariable: "DOWNLOAD_IOS_URL",
    packageFormat: "Store app",
  },
  {
    id: "zip",
    name: "Portable package",
    destination: "Browser download",
    environmentVariable: "DOWNLOAD_ZIP_URL",
    packageFormat: ".zip",
  },
];

function safeDownloadUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getDownloadManifest(): DownloadOption[] {
  return downloadConfiguration.map((option) => {
    const url = safeDownloadUrl(process.env[option.environmentVariable]);
    return {
      id: option.id,
      name: option.name,
      destination: option.destination,
      packageFormat: option.packageFormat,
      url,
      available: url !== null,
    };
  });
}
