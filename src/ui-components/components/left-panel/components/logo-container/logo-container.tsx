import styles from "./logo-container.module.scss";
import { useRouter } from "next/router";
import { redirectToPath, HOME_PAGE } from "../../../../../lib/navigation/routes";
import Image from "next/image";
import { Feature } from "../../../../../util/feature-flag/FeatureFlag";

export type LogoContainerProps = {};

//TO-DO: Need to make this component proper to take items as props. Before that required an unified Image component
export function LogoContainer(props: LogoContainerProps) {
  const router = useRouter();
  // const feature = useFeature("features");

  function navigateToHome() {
    redirectToPath(HOME_PAGE, router, window);
  }

  function onClickLogo() {}

  return (
    <div className={styles.logoContainer}>
      <div className={styles.cropLogo}>
        <Image onClick={navigateToHome} src="/images/Logo.svg" width={131} height={18} />
      </div>
      {/* <Button className={styles.bellIcon} icon={<BellFilledIcon />} label="" onClick={onClickLogo} /> */}
      {/* <div onClick={onClickLogo} className={styles.bellIcon}>
        <Image src="/images/icon-bell.svg" width={20} height={20} />
      </div> */}
      {/* {feature?.notification ?
        <div onClick={onClickLogo} className={styles.bellIcon}>
          <Image src="/images/icon-bell.svg" width={20} height={20} />
        </div> : null} */}
      <Feature name="features.notificationBell">
        <div onClick={onClickLogo} className={styles.bellIcon}>
          <Image src="/images/icon-bell.svg" width={20} height={20} />
        </div>
      </Feature>
    </div>
  );
}
