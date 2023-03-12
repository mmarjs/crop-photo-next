import React, { useEffect } from "react";
import { LOGIN_PAGE, redirectToApplication, redirectToPath } from "../../../lib/navigation/routes";
import { useRouter } from "next/router";
import { useIntercom } from "react-use-intercom";
import { toast } from "../../../ui-components/components/toast";
import styles from "./logout.module.scss";

/**
 *
 * @returns
 */
export default function Logout() {
  const LOGOUT_MSG: string = "Please wait. You are being redirected in a few seconds...";
  const router = useRouter();
  const { shutdown, boot } = useIntercom();

  useEffect(() => {
    shutdown();
    setTimeout(() => {
      redirectToPath(LOGIN_PAGE, router, window);
    }, 2000);
    return () => {
      setTimeout(() => {
        boot();
      }, 500);
    };
  }, [boot, router, shutdown]);

  return <div className={styles.logoutContainer}>{LOGOUT_MSG}</div>;
}
