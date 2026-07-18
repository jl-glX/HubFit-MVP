import { Button } from "./ui/button";

type PeriodType = "day" | "week" | "month";

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
}

export function PeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: PeriodSelectorProps) {
  const periods: { value: PeriodType; label: string }[] = [
    { value: "day", label: "Daily" },
    { value: "week", label: "Weekly" },
    { value: "month", label: "Monthly" },
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
