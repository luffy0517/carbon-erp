import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@carbon/react";

import { useControlField, useField } from "remix-validated-form";
import { Combobox as ComboboxBase } from "~/components";
import type { ComboboxProps as ComboboxBaseProps } from "~/components/Combobox";

export type ComboboxProps = Omit<ComboboxBaseProps, "onChange"> & {
  name: string;
  label?: string;
  helperText?: string;
  onChange?: (newValue: { value: string; label: string } | null) => void;
};

const Combobox = ({ name, label, helperText, ...props }: ComboboxProps) => {
  const { getInputProps, error } = useField(name);
  const [value, setValue] = useControlField<string | undefined>(name);

  const onChange = (value: string) => {
    if (value) {
      props?.onChange?.(props.options.find((o) => o.value === value) ?? null);
    } else {
      props?.onChange?.(null);
    }
  };

  return (
    <FormControl isInvalid={!!error}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <input
        {...getInputProps({
          id: name,
        })}
        type="hidden"
        name={name}
        id={name}
        value={value}
      />
      <ComboboxBase
        {...props}
        value={value}
        onChange={(newValue) => {
          setValue(newValue ?? "");
          onChange(newValue ?? "");
        }}
        className="w-full"
      />

      {error ? (
        <FormErrorMessage>{error}</FormErrorMessage>
      ) : (
        helperText && <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

Combobox.displayName = "Combobox";

export default Combobox;
