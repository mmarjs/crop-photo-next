import React from "react";

import { Input, InputProps } from "./input";

export const BasicInput = (props: InputProps) => <Input placeholder="value" />;

export const InputWithOuterLabel = React.forwardRef(
  (props: InputProps, ref?: ((instance: unknown | null) => void) | React.MutableRefObject<unknown | null> | null) => (
    <Input ref={ref} outerLabel={true} placeholder="value" labelText="label" {...props} />
  )
);

export const InputWithOuterLabelAndLink = React.forwardRef(
  (props: InputProps, ref?: ((instance: unknown | null) => void) | React.MutableRefObject<unknown | null> | null) => (
    <Input
      ref={ref}
      outerLabel={true}
      placeholder="value"
      labelText="label"
      linkText="link?"
      isLinkWithLabel={true}
      {...props}
    />
  )
);
