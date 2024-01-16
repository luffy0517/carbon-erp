import { useTimeField } from "@react-aria/datepicker";
import { useLocale } from "@react-aria/i18n";
import type { TimeFieldStateOptions } from "@react-stately/datepicker";
import { useTimeFieldState } from "@react-stately/datepicker";
import { useRef } from "react";
import { InputGroup } from "~/Input";
import { DateSegment } from "./components/DateSegment";

const TimePicker = (
  props: Omit<TimeFieldStateOptions, "locale" | "createCalendar">
) => {
  const { locale } = useLocale();
  const state = useTimeFieldState({
    ...props,
    locale,
  });

  const ref = useRef<HTMLDivElement>(null);
  const { fieldProps } = useTimeField(props, state, ref);

  return (
    <InputGroup {...fieldProps} ref={ref} className="px-4 py-2">
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
    </InputGroup>
  );
};

export default TimePicker;
