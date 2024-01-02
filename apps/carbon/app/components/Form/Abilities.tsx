import type { MultiValue } from "@carbon/react";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Select,
  useMount,
} from "@carbon/react";
import { useFetcher } from "@remix-run/react";
import { useMemo } from "react";
import { useControlField, useField } from "remix-validated-form";
import type { getAbilitiesList } from "~/modules/resources";
import { path } from "~/utils/path";
import type { SelectProps } from "./Select";

type AbilitiesSelectProps = Omit<SelectProps, "options" | "onChange"> & {
  onChange?: (
    selections: MultiValue<{
      value: string;
      label: string;
    }>
  ) => void;
};

const Abilities = ({
  name,
  label = "Abilities",
  helperText,
  isLoading,
  isReadOnly,
  placeholder = "Select Abilities",
  onChange,
  ...props
}: AbilitiesSelectProps) => {
  const { error } = useField(name);
  const [value, setValue] = useControlField<string[]>(name);

  const abilityFetcher =
    useFetcher<Awaited<ReturnType<typeof getAbilitiesList>>>();

  useMount(() => {
    abilityFetcher.load(path.to.api.abilities);
  });

  const options = useMemo(
    () =>
      abilityFetcher.data?.data
        ? abilityFetcher.data?.data.map((c) => ({
            value: c.id,
            label: c.name,
          }))
        : [],
    [abilityFetcher.data]
  );

  const handleChange = (
    selections: MultiValue<{ value: string; label: string }>
  ) => {
    const newValue = selections.map((s) => s.value as string) || [];
    setValue(newValue);
    onChange?.(selections);
  };

  const controlledValue = useMemo(
    () => options?.filter((option) => value?.includes(option.value)) ?? [],
    [value, options]
  );

  return (
    <FormControl isInvalid={!!error}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      {value.map((selection, index) => (
        <input
          key={`${name}[${index}]`}
          type="hidden"
          name={`${name}[${index}]`}
          value={selection}
        />
      ))}
      <Select
        {...props}
        isMulti
        value={controlledValue}
        isLoading={isLoading}
        options={options}
        placeholder={placeholder}
        onChange={handleChange}
      />
      {error ? (
        <FormErrorMessage>{error}</FormErrorMessage>
      ) : (
        helperText && <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

Abilities.displayName = "Abilities";

export default Abilities;
