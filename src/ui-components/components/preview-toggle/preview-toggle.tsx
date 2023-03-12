import React, { useState } from "react";
import { Radio } from "antd";
import classNames from "classnames";
import styles from "./preview-toggle.module.scss";
import { ComponentProp } from "../../../common/Types";
import { SMARTCROP_PREVIEW } from "../../../common/Enums";

export const PreviewToggle = ({ className }: ComponentProp) => {
  const [value, setValue] = useState(SMARTCROP_PREVIEW.ORIGINAL);

  return (
    <div className={classNames(styles.Wrapper, className)}>
      <h4>Preview</h4>
      <Radio.Group value={value} onChange={e => setValue(e.target.value)}>
        <Radio.Button value={SMARTCROP_PREVIEW.MODIFIED}>Modified</Radio.Button>
        <Radio.Button value={SMARTCROP_PREVIEW.ORIGINAL}>Original</Radio.Button>
      </Radio.Group>
    </div>
  );
};
