import { message } from "antd";
import styles from "./toast.module.scss";
import Image from "next/image";
import CloseWhite from "../../../../public/images/close-white.svg";
import CloseBlack from "../../../../public/images/close-black.svg";

export function toast(content: string, type: string = "success", duration: number = 10) {
  message.destroy();
  const config = {
    className: styles.toastWrapper,
    content: (
      <div className={styles.toastContent}>
        <span>{content}</span>
        <div onClick={() => message.destroy()} className={styles.closeIcon}>
          {type === "success" ? (
            <CloseBlack className={styles.icon} height={10} width={10} />
          ) : (
            <CloseWhite height={10} className={styles.icon} width={10} />
          )}
        </div>
      </div>
    ),
    duration
    // icon: <></>
  };

  if (content && type) {
    switch (type) {
      case "error": {
        // const newConfig = { icon: <ErrorIcon width={80} height={80} />, ...config };
        message.error(config);
        break;
      }
      case "warning": {
        // const newConfig = { icon: <></>, ...config };
        message.warning(config);
        break;
      }
      default: {
        const newConfig = { icon: <></>, ...config, className: styles.successToastWrapper };
        message.success(newConfig);
      }
    }
  }
}
