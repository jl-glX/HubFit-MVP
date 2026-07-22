import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

type PeriodType = "day" | "week" | "month";

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export function PeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: PeriodSelectorProps) {
  const { t } = useTranslation();
  const periods: { value: PeriodType; label: string }[] = [
    { value: "day", label: t("analytics.daily") },
    { value: "week", label: t("analytics.weekly") },
    { value: "month", label: t("analytics.monthly") },
  ];

  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <Button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          variant={selectedPeriod === period.value ? "default" : "outline"}
          size="sm"
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}
