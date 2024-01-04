import type { SystemStyleObject } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import type { GroupBase, SingleValueProps } from "react-select";

const SingleValue = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: SingleValueProps<Option, IsMulti, Group>
) => {
  const { children, className, cx, isDisabled, innerProps } = props;

  const initialSx: SystemStyleObject = {
    label: "singleValue",
    mx: "0.125rem",
    maxWidth: `calc(100% - 0.5rem)`,
    overflow: "hidden",
    position: "absolute",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    top: "50%",
    transform: "translateY(-50%)",
  };

  const sx = initialSx;

  return (
    <Box
      className={cx(
        {
          "single-value": true,
          "single-value--is-disabled": isDisabled,
        },
        className
      )}
      sx={sx}
      {...innerProps}
    >
      {children}
    </Box>
  );
};

export default SingleValue;
