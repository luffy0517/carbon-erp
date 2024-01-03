import type { MutableRefObject, ReactElement, RefAttributes } from "react";
import { forwardRef } from "react";
import type { GroupBase, SelectInstance } from "react-select";
import type { AsyncCreatableProps } from "react-select/async-creatable";
import AsyncCreatableReactSelect from "react-select/async-creatable";
import useSelectProps from "../useSelectProps";

export type AsyncCreatableSelectComponent = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: AsyncCreatableProps<Option, IsMulti, Group> &
    RefAttributes<SelectInstance<Option, IsMulti, Group>>
) => ReactElement;

// eslint-disable-next-line react/display-name
const AsyncCreatableSelect = forwardRef(
  <Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
    props: AsyncCreatableProps<Option, IsMulti, Group>,
    ref:
      | ((instance: SelectInstance<Option, IsMulti, Group> | null) => void)
      | MutableRefObject<SelectInstance<Option, IsMulti, Group> | null>
      | null
  ) => {
    const chakraSelectProps = useSelectProps(props);

    return <AsyncCreatableReactSelect ref={ref} {...chakraSelectProps} />;
  }
) as AsyncCreatableSelectComponent;

export default AsyncCreatableSelect;
