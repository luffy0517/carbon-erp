import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { forwardRef } from "react";
import { cn } from "./utils/cn";

const vStackVariants = cva("flex flex-col w-full items-start", {
  variants: {
    spacing: {
      0: "space-y-0",
      1: "space-y-1",
      2: "space-y-2",
      3: "space-y-3",
      4: "space-y-4",
      8: "space-y-8",
    },
  },
  defaultVariants: {
    spacing: 4,
  },
});

export interface VStackProps
  extends ComponentProps<"div">,
    VariantProps<typeof vStackVariants> {}

const VStack = forwardRef<HTMLDivElement, VStackProps>(
  ({ className, children, spacing, ...props }, ref) => {
    return (
      <div
        className={cn(
          vStackVariants({
            spacing,
            className,
          })
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
VStack.displayName = "VStack";

export { VStack };
