import { Button, VStack, cn } from "@carbon/react";
import type { Theme } from "@carbon/utils";
import { themes } from "@carbon/utils";
import { useEffect, useState } from "react";
import { RxCheck } from "react-icons/rx";
import { ValidatedForm } from "remix-validated-form";
import { Hidden, Submit } from "~/components/Form";
import { useMode } from "~/hooks/useMode";
import type { Theme as ThemeValue } from "~/modules/settings";
import { themeValidator } from "~/modules/settings";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type ThemeFormProps = {
  theme: TypeOfValidator<typeof themeValidator>;
};

const ThemeForm = ({ theme: defaultValues }: ThemeFormProps) => {
  const [theme, setTheme] = useState<ThemeValue>(defaultValues.theme);
  const mode = useMode();

  const onThemeChange = (t: Theme) => {
    setTheme(t.name);

    const variables = mode === "dark" ? t.cssVars.dark : t.cssVars.light;

    Object.entries(variables).forEach(([key, value]) => {
      document.body.style.setProperty(`--${key}`, value);
    });
  };

  useEffect(() => {
    const t = themes.find((t) => t.name === theme);
    if (t) {
      onThemeChange(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="w-full">
      <ValidatedForm
        method="post"
        action={path.to.theme}
        validator={themeValidator}
        defaultValues={defaultValues}
      >
        <VStack spacing={4} className="max-w-[520px]">
          <Hidden name="theme" value={theme} />
          <div className="grid grid-cols-3 gap-4">
            {themes.map((t) => {
              const isActive = theme === t.name;
              return (
                <Button
                  key={t.name}
                  variant="secondary"
                  onClick={() => onThemeChange(t)}
                  className={cn(
                    "justify-start",
                    isActive && "border-2 border-primary"
                  )}
                  style={
                    {
                      "--theme-primary": `hsl(${
                        t?.activeColor[mode === "dark" ? "dark" : "light"]
                      })`,
                    } as React.CSSProperties
                  }
                >
                  <span
                    className={cn(
                      "mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]"
                    )}
                  >
                    {isActive && <RxCheck className="h-4 w-4 text-white" />}
                  </span>
                  {t.label}
                </Button>
              );
            })}
          </div>
          <Submit>Save</Submit>
        </VStack>
      </ValidatedForm>
    </div>
  );
};

export default ThemeForm;
