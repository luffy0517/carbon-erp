import { Box } from "@chakra-ui/layout";
import { Menu as ChakraMenu, MenuIcon } from "@chakra-ui/menu";
import type { PropsOf, SystemStyleObject } from "@chakra-ui/system";
import { useColorModeValue, useMultiStyleConfig } from "@chakra-ui/system";
import React from "react";
import type {
  CoercedMenuPlacement,
  GroupBase,
  GroupHeadingProps,
  GroupProps,
  MenuListProps,
  MenuProps,
  NoticeProps,
  OptionProps,
} from "react-select";
import { FixedSizeList as List } from "react-window";
import type { SizeProps, ThemeObject } from "../types";
import { useSize } from "../utils";

const alignToControl = (placement: CoercedMenuPlacement) => {
  const placementToCSSProp = { bottom: "top", top: "bottom" };
  return placement ? placementToCSSProp[placement] : "top";
};

const Menu = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
  props: MenuProps<Option, IsMulti, Group>
) => {
  const { className, cx, children, innerProps, innerRef, placement } = props;

  const initialSx: SystemStyleObject = {
    position: "absolute",
    [alignToControl(placement)]: "100%",
    marginY: "8px",
    width: "100%",
    zIndex: 1,
  };

  const sx = initialSx;

  return (
    <ChakraMenu>
      <Box
        {...innerProps}
        ref={innerRef}
        className={cx({ menu: true }, className)}
        sx={sx}
      >
        {children}
      </Box>
    </ChakraMenu>
  );
};

export default Menu;

const MenuItemHeightBySize = {
  sm: 31,
  md: 37,
  lg: 43,
} as const;

interface OptionTypeBase {
  [key: string]: any;
}

export const MenuList = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: MenuListProps<Option, IsMulti, Group>
) => {
  const {
    className,
    cx,
    innerRef,
    maxHeight,
    isMulti,
    innerProps,
    selectProps: { size: sizeProp },
  } = props;

  const list = React.useRef<List>(null);
  const menuStyles = useMultiStyleConfig("Menu");

  // We're pulling in the border radius from the theme for the input component
  // so we can match the menu lists' border radius to it, but in 2.8.0 the value
  // was changed to being pulled from a theme variable instead of being hardcoded
  const size = useSize(sizeProp);
  const inputStyles = useMultiStyleConfig("Input", {
    size,
  });
  const fieldStyles = inputStyles.field as Record<string, string>;

  const initialSx: SystemStyleObject = {
    ...menuStyles.list,
    minW: "100%",
    maxHeight: `${maxHeight}px`,
    overflowY: "auto",
    // This is hacky, but it works. May be removed in the future
    "--input-border-radius": fieldStyles?.["--input-border-radius"],
    borderRadius: fieldStyles?.borderRadius || menuStyles.list?.borderRadius,
    position: "relative", // required for offset[Height, Top] > keyboard scroll
    WebkitOverflowScrolling: "touch",
  };

  const sx = initialSx;

  const children = React.useMemo<React.ReactElement[]>(() => {
    const _children = React.Children.toArray(
      props.children
    ) as React.ReactElement[];

    const head = _children[0] || {};

    if (
      React.isValidElement<
        OptionProps<OptionTypeBase, boolean, GroupBase<OptionTypeBase>>
      >(head)
    ) {
      const { props: { data: { options = [] } = {} } = {} } = head;
      const groupedChildrenLength = options.length;
      const isGrouped = groupedChildrenLength > 0;
      const flattenedChildren = isGrouped
        ? flattenGroupedChildren(_children as React.ReactElement[])
        : [];

      return isGrouped ? flattenedChildren : _children;
    } else {
      return [];
    }
  }, [props.children]);

  const itemCount = Array.isArray(children) ? children.length : 0;
  const itemHeight = MenuItemHeightBySize[size ?? "md"];
  const initialOffset = itemHeight * getCurrentIndex(children);

  return (
    <Box
      {...innerProps}
      className={cx(
        {
          "menu-list": true,
          "menu-list--is-multi": isMulti,
        },
        className
      )}
      sx={sx}
    >
      <List
        width="100%"
        ref={list}
        outerRef={innerRef}
        height={Math.min(maxHeight, itemHeight * itemCount + 4)}
        itemCount={itemCount}
        itemData={children}
        itemSize={itemHeight}
        initialScrollOffset={initialOffset}
      >
        {({ data, index, style }: any) => {
          return (
            <div
              style={{
                ...style,
                top: `${parseFloat(style.top.toString())}px`,
              }}
            >
              {data[index]}
            </div>
          );
        }}
      </List>
    </Box>
  );
};

export const LoadingMessage = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: NoticeProps<Option, IsMulti, Group>
) => {
  const {
    children,
    className,
    cx,
    innerProps,
    selectProps: { size: sizeProp },
  } = props;

  const size = useSize(sizeProp);

  const verticalPaddings: SizeProps = {
    sm: "6px",
    md: "8px",
    lg: "10px",
  };

  const initialSx: SystemStyleObject = {
    color: "chakra-subtle-text",
    textAlign: "center",
    paddingY: verticalPaddings[size],
    fontSize: size,
  };

  const sx = initialSx;

  return (
    <Box
      {...innerProps}
      className={cx(
        {
          "menu-notice": true,
          "menu-notice--loading": true,
        },
        className
      )}
      sx={sx}
    >
      {children}
    </Box>
  );
};

export const NoOptionsMessage = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: NoticeProps<Option, IsMulti, Group>
) => {
  const {
    children,
    className,
    cx,
    innerProps,
    selectProps: { size: sizeProp },
  } = props;

  const size = useSize(sizeProp);

  const verticalPaddings: SizeProps = {
    sm: "6px",
    md: "8px",
    lg: "10px",
  };

  const initialSx: SystemStyleObject = {
    color: "chakra-subtle-text",
    textAlign: "center",
    paddingY: verticalPaddings[size],
    fontSize: size,
  };

  const sx = initialSx;

  return (
    <Box
      {...innerProps}
      className={cx(
        {
          "menu-notice": true,
          "menu-notice--no-options": true,
        },
        className
      )}
      sx={sx}
    >
      {children}
    </Box>
  );
};

export const Group = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: GroupProps<Option, IsMulti, Group>
) => {
  const {
    children,
    className,
    cx,
    theme,
    getStyles,
    Heading,
    headingProps,
    label,
    selectProps,
    innerProps,
    getClassNames,
  } = props;

  const sx = {};

  return (
    <Box {...innerProps} className={cx({ group: true }, className)} sx={sx}>
      <Heading
        {...headingProps}
        selectProps={selectProps}
        cx={cx}
        theme={theme}
        getStyles={getStyles}
        getClassNames={getClassNames}
      >
        {label}
      </Heading>
      <Box>{children}</Box>
    </Box>
  );
};

export const GroupHeading = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: GroupHeadingProps<Option, IsMulti, Group>
) => {
  const {
    cx,
    className,
    children,
    selectProps: { size: sizeProp, hasStickyGroupHeaders },
  } = props;

  const menuStyles = useMultiStyleConfig("Menu");

  const size = useSize(sizeProp);

  const fontSizes: SizeProps = {
    sm: "xs",
    md: "sm",
    lg: "md",
  };
  const paddings: SizeProps = {
    sm: "0.4rem 0.8rem",
    md: "0.5rem 1rem",
    lg: "0.6rem 1.2rem",
  };

  const initialSx: SystemStyleObject = {
    ...menuStyles.groupTitle,
    fontSize: fontSizes[size],
    padding: paddings[size],
    margin: 0,
    borderBottomWidth: hasStickyGroupHeaders ? "1px" : 0,
    position: hasStickyGroupHeaders ? "sticky" : "static",
    top: -2,
    bg: menuStyles.list.bg,
    zIndex: 1,
  };

  const sx = initialSx;

  return (
    <Box className={cx({ "group-heading": true }, className)} sx={sx}>
      {children}
    </Box>
  );
};

/**
 * The `CheckIcon` component from the Chakra UI Menu
 *
 * @see {@link https://github.com/chakra-ui/chakra-ui/blob/eb0316ddf96dd259433724062e923c33e6eee729/packages/components/menu/src/menu-item-option.tsx#L10-L17}
 */
const CheckIcon: React.FC<PropsOf<"svg">> = (props) => (
  <svg viewBox="0 0 14 14" width="1em" height="1em" {...props}>
    <polygon
      fill="currentColor"
      points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039"
    />
  </svg>
);

export const Option = <
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
>(
  props: OptionProps<Option, IsMulti, Group>
) => {
  const {
    className,
    cx,
    innerRef,
    innerProps,
    children,
    isFocused,
    isDisabled,
    isSelected,
    selectProps: {
      size: sizeProp,
      isMulti,
      hideSelectedOptions,
      selectedOptionStyle,
    },
  } = props;

  const size = useSize(sizeProp);

  const menuItemStyles: ThemeObject = useMultiStyleConfig("Menu").item;

  const paddings: SizeProps = {
    sm: "0.3rem 0.6rem",
    md: "0.4rem 0.8rem",
    lg: "0.5rem 1rem",
  };

  const selectedBg = useColorModeValue(`blue.500`, `blue.300`);
  const selectedColor = useColorModeValue("white", "black");

  // Don't create exta space for the checkmark if using a multi select with
  // options that dissapear when they're selected
  const showCheckIcon: boolean =
    selectedOptionStyle === "check" &&
    (!isMulti || hideSelectedOptions === false);

  const shouldHighlight: boolean =
    selectedOptionStyle === "color" && isSelected;

  const initialSx: SystemStyleObject = {
    ...menuItemStyles,
    display: "flex",
    alignItems: "center",
    width: "100%",
    textAlign: "start",
    fontSize: size,
    padding: paddings[size],
    ...(isFocused && menuItemStyles._focus),
    ...(shouldHighlight && {
      bg: selectedBg,
      color: selectedColor,
      _active: { bg: selectedBg },
    }),
    ...(isDisabled && menuItemStyles._disabled),
    ...(isDisabled && { _active: {} }),
  };

  const sx = initialSx;

  return (
    <Box
      {...innerProps}
      role="button"
      className={cx(
        {
          option: true,
          "option--is-disabled": isDisabled,
          "option--is-focused": isFocused,
          "option--is-selected": isSelected,
        },
        className
      )}
      sx={sx}
      ref={innerRef}
      data-disabled={isDisabled ? true : undefined}
      aria-disabled={isDisabled ? true : undefined}
    >
      {showCheckIcon && (
        <MenuIcon
          fontSize="0.8em"
          marginEnd="0.75rem"
          opacity={isSelected ? 1 : 0}
        >
          <CheckIcon />
        </MenuIcon>
      )}
      {children}
    </Box>
  );
};

export function flattenGroupedChildren(children: React.ReactElement[]) {
  return children.reduce<React.ReactElement[]>((result, child) => {
    const {
      props: { children: nestedChildren = [] },
    } = child;

    return [
      ...result,
      React.cloneElement(child, { type: "group" }, []),
      ...nestedChildren,
    ];
  }, []);
}

export function isFocused({ props: { isFocused } }: React.ReactElement) {
  return isFocused === true;
}

export function getCurrentIndex(children: React.ReactElement[]) {
  return Math.max(children.findIndex(isFocused), 0);
}
