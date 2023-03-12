import { useState, useEffect, MouseEvent } from "react";
import styles from "../../../styles/Data.module.css";
import { Divider } from "../divider/index";
import AuthenticationController from "../../../controller/AuthenticationController";
import { VerifyCode } from "../verify-code/index";
import { Button } from "../button/index";
import { HLayout } from "../hLayout/index";

type DeleteDataProps = {
  onOK: (e: MouseEvent<HTMLElement>) => void;
  onCancel: (e: MouseEvent<HTMLElement>) => void;
};

const DeleteData = ({ onOK, onCancel }: DeleteDataProps) => {
  const [userEmail, setUserEmail] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const onSubmitCode = async () => {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(null);
      }, 3000);
    });
    setCodeVerified(true);
  };

  const resendCode = (e: MouseEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    let isMounted = true;
    AuthenticationController.fetchCurrentAuthenticatedUser().then(user => {
      user.getUserAttributes((_, result) => {
        if (result && isMounted) {
          const email = result.find(({ Name }) => Name === "email")?.Value;
          setUserEmail(email ?? "");
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <p className={styles.DeleteDataDesc}>
        This will delete your history, imports, integrations, work queue and any preferences you might have set. This is
        a permanent action that cannot be undone. This will not delete your account or billing information.
      </p>
      <Divider />
      <h5 className={styles.DeleteDataNotification}>
        We’ve sent a one time code to your email ending in ***** {userEmail.split("@")[1]}
      </h5>
      <div className={styles.ResendLink}>
        <a href="#" onClick={resendCode}>
          Resend code
        </a>
      </div>
      <VerifyCode
        label="Enter code"
        submitButtonLabel={""}
        onSubmitClick={onSubmitCode}
        autoSubmit={true}
        size="sm"
        showResendCode={false}
      />
      <HLayout hAlign="flex-end" noPadding={true} noFlex={true} style={{ marginTop: 48 }} gap={16}>
        <Button
          type="primary"
          danger={true}
          label="Delete my data permanently"
          onClick={onOK}
          disabled={!codeVerified}
        />
        <Button type="text" label="Cancel" onClick={onCancel} />
      </HLayout>
    </>
  );
};

export default DeleteData;
