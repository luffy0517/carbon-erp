import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/react";
import { useState } from "react";
import { useField } from "remix-validated-form";
import { UserSelect } from "../Selectors";
import type {
  SelectionItemInterface,
  UserSelectProps,
} from "../Selectors/UserSelect/types";

export type EmployeesProps = {
  name: string;
  label?: string;
  helperText?: string;
} & UserSelectProps;

const Employees = ({ name, label, helperText, ...props }: EmployeesProps) => {
  const { error, defaultValue, validate } = useField(name);
  const [selections, setSelections] = useState<string[]>(defaultValue);

  const handleChange = (items: SelectionItemInterface[]) => {
    setSelections(items.map((item) => item.id));
    validate();
  };

  return (
    <FormControl isInvalid={!!error}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      {selections.map((selection, index) => (
        <input
          key={`${name}[${index}]`}
          type="hidden"
          name={`${name}[${index}]`}
          value={selection}
        />
      ))}
      <UserSelect
        {...props}
        type="employee"
        usersOnly
        isMulti
        value={selections}
        onChange={handleChange}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default Employees;
