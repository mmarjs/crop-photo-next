import React, { useEffect, useState } from "react";
import { Icon, IconProps } from "./icon";

import IconGoogle from "../../assets/icons/icon-google.svg";
import IconFacebook from "../../assets/icons/icon-facebook.svg";
import IconAmazon from "../../assets/icons/icon-amazon.svg";
import IconHidden from "../../assets/icons/icon-hidden.svg";
import { HelpIconDark, HelpIconWhite } from "../../assets";
import { useIntercom } from "react-use-intercom";

/**
 *
 * @param props
 * @returns
 */
export const HiddenIcon = (props: IconProps) => <Icon component={IconHidden} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export const GoogleIcon = (props: IconProps) => <Icon component={IconGoogle} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export const FacebookIcon = (props: IconProps) => <Icon component={IconFacebook} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export const AmazonIcon = (props: IconProps) => <Icon component={IconAmazon} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export function SVGIcon(props: IconProps) {
  const iconPath: string | undefined = props.src;
  const [iconObj, setIconObj] = useState();

  useEffect(() => {
    import(props.src ? props.src : "").then(obj => setIconObj(obj)).catch(err => setIconObj(IconHidden));
  }, []);

  return <Icon component={iconObj} {...props} />;
}

const openInAppHelpIconDefaultProps = {
  dark: true,
  width: 16
};
export type OpenInAppHelpIconProps = {
  article: number | string;
  dark?: boolean;
  width?: number;
} & typeof openInAppHelpIconDefaultProps;

export function OpenInAppHelp({ article, dark, width }: OpenInAppHelpIconProps) {
  const { showArticle } = useIntercom();
  const onIconClick = () => {
    if (typeof article === "string" && article.startsWith("https://")) {
      window.open(article, "_blank");
    } else if (typeof article === "number") {
      showArticle(article);
    }
  };
  if (dark) {
    return <HelpIconDark style={{ cursor: "hand" }} width={16} viewBox="0 0 18 16" onClick={() => onIconClick()} />;
  } else {
    return <HelpIconWhite style={{ cursor: "hand" }} width={16} viewBox="0 0 18 16" onClick={() => onIconClick()} />;
  }
}

OpenInAppHelp.defaultProps = openInAppHelpIconDefaultProps;
