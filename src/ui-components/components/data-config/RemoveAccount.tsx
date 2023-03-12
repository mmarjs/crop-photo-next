import { useState, useEffect, MouseEvent } from "react";
import styles from "../../../styles/Data.module.css";
import { Divider } from "../divider/index";
import AuthenticationController from "../../../controller/AuthenticationController";
import { VerifyCode } from "../verify-code/index";
import { Button } from "../button/index";
import { HLayout } from "../hLayout/index";
import { VLayout } from "../vLayout/index";
import { Label } from "../label/index";
import { Select } from "antd";

type RemoveAccountProps = {
  onOK: (e: MouseEvent<HTMLElement>) => void;
  onCancel: (e: MouseEvent<HTMLElement>) => void;
};

const RemoveAccount = ({ onOK, onCancel }: RemoveAccountProps) => {
  const [userEmail, setUserEmail] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [reason, setReason] = useState("");
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

  const selectReason = (value: string) => {
    setReason(value);
  };

  return (
    <>
      <p className={styles.DeleteDataDesc}>
        This will delete all your data and remove your account from Evolphin Cloud. This is a permanent action that
        cannot be undone.
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
      <Divider />
      <VLayout noMargin={true} gap={8}>
        <Label labelText="Reason" />
        <Select placeholder="Select a reason" className={styles.CustomSelector} onChange={selectReason}>
          <Select.Option value="expensive">Too expensive</Select.Option>
        </Select>
      </VLayout>
      <HLayout hAlign="flex-end" noPadding={true} noFlex={true} style={{ marginTop: 48 }} gap={16}>
        <Button
          type="primary"
          danger={true}
          label="Remove account permanently"
          onClick={onOK}
          disabled={!codeVerified || !reason}
        />
        <Button type="text" label="Cancel" onClick={onCancel} />
      </HLayout>
    </>
  );
};

export default RemoveAccount;
