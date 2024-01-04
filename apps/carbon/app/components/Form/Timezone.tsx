import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  ReactSelect as SelectBase,
  createFilter,
} from "@carbon/react";
import { useMemo } from "react";
import { useField } from "remix-validated-form";
import { timezonesGroupedByCountry } from "~/config/timezones";

export type TimezoneProps = {
  name: string;
  label?: string;
  helperText?: string;
  isReadOnly?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  onChange?: (
    newValue: { value: string | number; label: string } | null
  ) => void;
};

const Timezone = ({
  name,
  label,
  helperText,
  isLoading,
  isReadOnly,
  placeholder,
  onChange,
  ...props
}: TimezoneProps) => {
  const { getInputProps, error, defaultValue } = useField(name);
  const initialValue = useMemo(
    () =>
      timezonesGroupedByCountry
        .flatMap((group) => group.options)
        .find((option) => option.value === defaultValue),
    [defaultValue]
  );

  return (
    <FormControl isInvalid={!!error}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <SelectBase
        {...getInputProps({
          // @ts-ignore
          id: name,
        })}
        {...props}
        defaultValue={initialValue}
        isReadOnly={isReadOnly}
        isLoading={isLoading}
        options={timezonesGroupedByCountry}
        // Only search the labels (not the values)
        filterOption={createFilter({
          matchFrom: "any",
          stringify: (option) => `${option.label}`,
        })}
        placeholder={placeholder ?? "Select a timezone"}
        onChange={onChange ?? undefined}
      />
      {error ? (
        <FormErrorMessage>{error}</FormErrorMessage>
      ) : (
        helperText && <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

Timezone.displayName = "Timezone";

export default Timezone;
