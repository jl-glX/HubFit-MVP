import type { TFunction } from "i18next";

const demoClassKeys: Record<string, string> = {
  "Yoga Flow": "yogaFlow",
  "HIIT Bootcamp": "hiitBootcamp",
  "Pilates Core": "pilatesCore",
  Spinning: "spinning",
  "Box Fit": "boxFit",
  Zumba: "zumba",
};

export function localizeClass(
  name: string,
  description: string | undefined,
  t: TFunction,
): { name: string; description: string | undefined } {
  const key = demoClassKeys[name];

  if (!key) {
    return { name, description };
  }

  return {
    name: t(`demoClasses.${key}.name`),
    description: description
      ? t(`demoClasses.${key}.description`, { defaultValue: description })
      : description,
  };
}
