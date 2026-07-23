import { Plus, Trash2, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SavedAccount } from "../lib/saved-accounts";

interface SavedAccountSelectorProps {
  accounts: SavedAccount[];
  onSelect: (account: SavedAccount) => void;
  onRemove: (accountId: string) => void;
  onUseAnother: () => void;
}

export function SavedAccountSelector({
  accounts,
  onSelect,
  onRemove,
  onUseAnother,
}: SavedAccountSelectorProps) {
  const { t } = useTranslation();
  if (accounts.length === 0) return null;

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-3">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t("savedAccounts.title")}
      </p>
      <div className="space-y-1">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="group flex items-center gap-2 rounded-xl hover:bg-slate-50"
          >
            <button
              type="button"
              onClick={() => onSelect(account)}
              className="flex min-w-0 flex-1 items-center gap-3 p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {account.avatarDataUrl ? (
                <img
                  src={account.avatarDataUrl}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <UserRound size={19} />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {account.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {account.identifier} · {t(`roles.${account.role}`)}
                </span>
              </span>
            </button>
            <button
              type="button"
              aria-label={t("savedAccounts.remove", { name: account.name })}
              title={t("savedAccounts.remove", { name: account.name })}
              onClick={() => onRemove(account.id)}
              className="mr-2 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onUseAnother}
          className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Plus size={18} />
          {t("savedAccounts.useAnother")}
        </button>
      </div>
      <p className="px-2 pt-2 text-xs leading-relaxed text-slate-500">
        {t("savedAccounts.privacy")}
      </p>
    </section>
  );
}
