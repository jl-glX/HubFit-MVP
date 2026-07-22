import { useState } from "react";
import { ImagePlus, Save, Trash2, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { authFetch } from "../lib/api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";

const MAX_AVATAR_BYTES = 512 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function ProfilePhotoSettings() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [avatarDataUrl, setAvatarDataUrl] = useState(user?.avatarDataUrl ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const readAvatar = async (file: File) => {
    setSaved(false);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t("profilePhoto.invalidType"));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError(t("profilePhoto.tooLarge"));
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setAvatarDataUrl(dataUrl);
    setError("");
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const response = await authFetch(`${API_BASE}/api/account/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarDataUrl }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? t("profilePhoto.saveError"));
      }
      await refreshUser();
      setError("");
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-6 rounded-3xl border-slate-200 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {avatarDataUrl ? (
          <img
            src={avatarDataUrl}
            alt={t("profilePhoto.avatarAlt", { name: user?.name })}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-100"
          />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-4 ring-slate-50">
            <UserRound size={38} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-slate-950">
            {t("profilePhoto.title")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {t("profilePhoto.description")}
          </p>
          <Input
            id="profile-photo"
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readAvatar(file);
              event.target.value = "";
            }}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" variant="outline" asChild>
              <label htmlFor="profile-photo" className="cursor-pointer">
                <ImagePlus /> {t("profilePhoto.choose")}
              </label>
            </Button>
            {avatarDataUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAvatarDataUrl("");
                  setSaved(false);
                }}
              >
                <Trash2 /> {t("profilePhoto.remove")}
              </Button>
            )}
            <Button type="button" onClick={save} disabled={saving}>
              <Save />
              {saving ? t("profilePhoto.saving") : t("profilePhoto.save")}
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          {saved && (
            <p className="mt-3 text-sm text-emerald-700">
              {t("profilePhoto.saved")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
