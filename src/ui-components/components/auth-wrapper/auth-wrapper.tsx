import { ComponentProp } from "../../../common/Types";
import { Divider } from "../divider";
import { VerticalButtonBar } from "../vertical-button-bar";
import styles from "./auth-wrapper.module.scss";

import GoogleIcon from "../../../../public/images/google.svg";
import FbIcon from "../../../../public/images/facebook.svg";
import AmazonIcon from "../../../../public/images/amazon-login.svg";
import AppleIcon from "../../../../public/images/apple.svg";
import classNames from "classnames";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

type AuthWrapperProps = ComponentProp & {
  title: string;
  description?: string;
  onSocialButtonClick?: (id: string) => void;
  verticalMiddle?: boolean;
  className?: string;
  page?: string;
};

const AuthWrapper = ({
  title,
  description,
  onSocialButtonClick,
  verticalMiddle,
  children,
  className,
  page
}: AuthWrapperProps) => {
  const { t } = useTranslation();

  const loginButtonsArr = useMemo(
    () => [
      {
        id: "google",
        icon: <GoogleIcon />,
        label: t("login.sso.google")
      },
      {
        id: "facebook",
        icon: <FbIcon />,
        label: t("login.sso.facebook")
      },
      {
        id: "amazon",
        icon: <AmazonIcon />,
        label: t("login.sso.amazon")
      },
      {
        id: "apple",
        icon: <AppleIcon />,
        label: t("login.sso.apple")
      }
    ],
    [t]
  );

  return (
    <>
      <div className={styles.logoWrapper}>
        <Image src="/images/Logo.svg" width={174} height={24} />
      </div>
      <main className={classNames(styles.Wrapper, className)}>
        <img src="/images/login-image-new-crop.jpg" alt="" className={styles.CoverImage} />
        <div
          className={classNames(styles.MainContent, {
            [styles.VerticalMiddle]: verticalMiddle
          })}
        >
          <h1 className={styles.Title}>{title}</h1>
          {!!description && <p className={styles.Description}>{description}</p>}
          <div
            className={classNames({
              [styles.FormBlock]: page !== "otp"
            })}
          >
            {children}
          </div>
          {onSocialButtonClick && (
            <>
              <Divider className={styles.Divider} />
              <VerticalButtonBar buttonArr={loginButtonsArr} onVerticalButtonClick={onSocialButtonClick} />
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default AuthWrapper;
