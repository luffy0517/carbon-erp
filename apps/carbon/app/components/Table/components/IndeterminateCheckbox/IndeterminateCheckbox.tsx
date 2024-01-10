import { Checkbox } from "@chakra-ui/react";

type IndeterminateCheckboxProps = {
  checked: boolean;
  indeterminate: boolean;
  [key: string]: any;
};

const IndeterminateCheckbox = ({
  indeterminate,
  checked,
  ...rest
}: IndeterminateCheckboxProps) => {
  return (
    <Checkbox
      isChecked={checked}
      isIndeterminate={indeterminate}
      ml={2}
      {...rest}
    >
      <span className="sr-only">Select Row</span>
    </Checkbox>
  );
};

IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

export default IndeterminateCheckbox;
