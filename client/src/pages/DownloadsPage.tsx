import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Apple,
  Archive,
  Download,
  Laptop,
  MonitorDown,
  Smartphone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { authFetch } from "../lib/api";
import { Button } from "../components/ui/button";

type DownloadPlatform = "windows" | "android" | "macos" | "ios" | "zip";

interface DownloadOption {
  id: DownloadPlatform;
  name: string;
  destination: string;
  url: string | null;
  available: boolean;
  packageFormat: string;
}

function detectPlatform(): DownloadPlatform | null {
  const source = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  if (/iphone|ipad|ipod/.test(source)) return "ios";
  if (/android/.test(source)) return "android";
  if (/mac/.test(source)) return "macos";
  if (/win/.test(source)) return "windows";
  return null;
}

const platformIcons = {
  windows: Laptop,
  android: Smartphone,
  macos: Apple,
  ios: Apple,
  zip: Archive,
};

export function DownloadsPage() {
  const { t } = useTranslation();
  const [downloads, setDownloads] = useState<DownloadOption[]>([]);
  const [error, setError] = useState("");
  const detectedPlatform = useMemo(detectPlatform, []);

  const loadDownloads = useCallback(async () => {
    try {
      const response = await authFetch("/api/downloads");
      if (!response.ok) throw new Error(t("downloads.loadError"));
      const data = (await response.json()) as { downloads: DownloadOption[] };
      setDownloads(data.downloads);
      setError("");
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t("downloads.loadError"),
      );
    }
  }, [t]);

  useEffect(() => {
    void loadDownloads();
  }, [loadDownloads]);

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-slate-950 px-4 py-12 text-white sm:px-6">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/6 p-7 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-300">
            <MonitorDown size={28} />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
            {t("downloads.eyebrow")}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            {t("downloads.title")}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            {t("downloads.description")}
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {downloads.map((option) => {
            const Icon = platformIcons[option.id];
            const recommended = option.id === detectedPlatform;
            return (
              <article
                key={option.id}
                className={`rounded-2xl border p-6 ${
                  recommended
                    ? "border-cyan-300/60 bg-cyan-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                    <Icon size={24} />
                  </span>
                  {recommended && (
                    <span className="rounded-full bg-cyan-300 px-2.5 py-1 text-xs font-bold text-slate-950">
                      {t("downloads.recommended")}
                    </span>
                  )}
                </div>
                <h2 className="mt-5 text-xl font-bold">
                  {t(`downloads.platforms.${option.id}.name`, {
                    defaultValue: option.name,
                  })}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t(`downloads.platforms.${option.id}.destination`, {
                    defaultValue: option.destination,
                  })}{" "}
                  ·{" "}
                  {t(`downloads.platforms.${option.id}.format`, {
                    defaultValue: option.packageFormat,
                  })}
                </p>
                {option.available && option.url ? (
                  <a
                    href={option.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 block"
                  >
                    <Button className="w-full gap-2 bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                      <Download size={17} />
                      {t("downloads.download")}
                    </Button>
                  </a>
                ) : (
                  <Button className="mt-6 w-full" variant="outline" disabled>
                    {t("downloads.comingSoon")}
                  </Button>
                )}
              </article>
            );
          })}
        </div>

        <p className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-400">
          {t("downloads.securityNotice")}
        </p>
      </section>
    </main>
  );
}
