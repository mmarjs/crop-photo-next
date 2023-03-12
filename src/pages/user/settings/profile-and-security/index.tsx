import { NAVIGATION_MENU } from "../../../../common/Enums";
import { SETTINGS_PAGE, SETTING_AND_PROFILE_PAGE } from "../../../../lib/navigation/routes";
import { HLayout } from "../../../../ui-components/components/hLayout";
import { LeftPanel } from "../../../../ui-components/components/left-panel";
import styles from "../../../../styles/Profile.module.css";
import { Breadcrumbs } from "../../../../ui-components/components/breadcrumb";
import { Divider } from "../../../../ui-components/components/divider";
import { InputWithOuterLabel } from "../../../../ui-components/components/input";
import { VLayout } from "../../../../ui-components/components/vLayout";
import { Button } from "../../../../ui-components/components/button";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import AuthenticationController from "../../../../controller/AuthenticationController";
import { Label } from "../../../../ui-components/components/label";
import { useTranslation } from "react-i18next";
import { Logger } from "aws-amplify";
import { Skeleton } from "antd";
import { COGNITO_TENANT_ID_ATTRIBUTE_NAME } from "../../../../util/auth/Authenticator";
import {
  CognitoIdentityProviderClient,
  ChangePasswordCommand,
  ChangePasswordCommandInput
} from "@aws-sdk/client-cognito-identity-provider";
import { toast } from "../../../../ui-components/components/toast";

const getProviderName = (identities: any) => {
  const providerName = identities[0].providerName;
  switch (providerName) {
    case AuthenticationController.SSO_AMAZON:
      return "Amazon";
    case AuthenticationController.SSO_APPLE:
      return "Apple";
    case AuthenticationController.SSO_GOOGLE:
      return "Google";
    case AuthenticationController.SSO_FACEBOOK:
      return "Facebook";
    default:
      return "";
  }
};

const logger = new Logger("pages:user:profile-and-security");

const ProfileAndSecurity = () => {
  const { t } = useTranslation();
  const breadcrumbPathArray = [
    [t("settings.title"), SETTINGS_PAGE],
    [t("settings.profile_and_security"), SETTING_AND_PROFILE_PAGE]
  ];
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
    confirmPassword?: string;
  }>();
  const [validEmail, setValidEmail] = useState(true);
  const [validPassword, setValidPassword] = useState(false);
  const [matchedPassword, setMatchedPassword] = useState(true);
  const [isPasswordChange, setIsPasswordChange] = useState(false);
  const [isPasswordNotOld, setIsPasswordNotOld] = useState(true);
  const [isSSOLogin, setIsSSOLogin] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tenantId, setTenantId] = useState<string | undefined>("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    setIsLoading(true);
    AuthenticationController.fetchCurrentAuthenticatedUser().then(user => {
      const userSession = user?.getSession((_error: any, session: any) => {
        logger.debug("getting session:", session.accessToken.jwtToken);
        const token = session.accessToken.jwtToken;
        setAccessToken(token);
      });
      user.getUserAttributes((_, result) => {
        if (result) {
          setIsSSOLogin(false);
          setTenantId(
            result.find(userAttribute => userAttribute.getName() === COGNITO_TENANT_ID_ATTRIBUTE_NAME)?.getValue()
          );
          const identities = result.find(({ Name }) => Name === "identities")?.Value ?? "";
          if (identities) {
            const parsedIdentities = JSON.parse(identities);
            const providerName = getProviderName(parsedIdentities);
            setIsSSOLogin(true);
            setProviderName(providerName);
          }
          const email = result.find(({ Name }) => Name === "email")?.Value ?? "";
          if (!email) {
            setValidEmail(false);
          }
          const fullName = result.find(({ Name }) => Name === "name")?.Value ?? "";
          const firstName = result.find(({ Name }) => Name === "given_name")?.Value ?? "";
          const lastName = result.find(({ Name }) => Name === "family_name")?.Value ?? "";
          setUser({
            firstName: !!identities && !!fullName ? fullName : firstName,
            lastName: !!identities && !!fullName ? "" : lastName,
            email
          });
        }
        setIsLoading(false);
      });
    });
  }, []);

  const updateUser = (e: ChangeEvent<HTMLInputElement>, key: string) => {
    setUser({
      ...user,
      [key]: e.target.value
    });

    if (key === "email") {
      if (AuthenticationController.isValidEmail(e.target.value)) {
        setValidEmail(true);
      } else {
        setValidEmail(false);
      }
    } else if (key === "password") {
      try {
        if (!e.target.value || AuthenticationController.isValidPassword(e.target.value)) {
          setValidPassword(true);
        }
        if (e.target.value !== user?.currentPassword) {
          setValidPassword(true);
        }
      } catch (err) {
        setValidPassword(false);
      }
    }
  };

  const confirmPassword = (e: ChangeEvent<HTMLInputElement>) => {
    updateUser(e, "confirmPassword");

    if (!user?.password || e.target.value === user?.password) {
      setMatchedPassword(true);
    } else {
      setMatchedPassword(false);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsPasswordNotOld(true);
    const isSamePassword = user?.currentPassword === e.target.value;
    if (isSamePassword) {
      setIsPasswordNotOld(false);
    }
    updateUser(e, "password");
  };
  const isDisabled = !validPassword || !validEmail || !matchedPassword || !isPasswordNotOld;
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isDisabled) return;

    // Update user
    const client = new CognitoIdentityProviderClient({
      region: "us-east-2"
    });
    const input: ChangePasswordCommandInput = {
      PreviousPassword: user?.currentPassword,
      ProposedPassword: user?.password,
      AccessToken: accessToken
    };
    const command = new ChangePasswordCommand(input);
    setIsUpdatingPassword(true);
    try {
      await client.send(command);
      toast(t("settings.form.password_change_success"));
    } catch (error: any) {
      logger.error("error", error?.message ?? error);
      toast(error?.message ?? error, "error");
    } finally {
      setIsUpdatingPassword(false);
      setUser(old => ({
        ...old,
        password: "",
        confirmPassword: "",
        currentPassword: ""
      }));
    }
  };

  return (
    <HLayout noFlex={true} noPadding={true} hAlign="flex-start" vAlign="unset" style={{ height: "100vh" }}>
      <LeftPanel selectedPage={NAVIGATION_MENU.SETTINGS} />
      <div className={styles.MainContent}>
        <div className={styles.PageBreadcrumb}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>
        <div className={styles.CardContent}>
          <h1 className={styles.Title}>{t("settings.profile.label")}</h1>
          <Divider className={styles.Divider} />
          <form onSubmit={onSubmit}>
            <VLayout noMargin={true} noFlex={true} gap={24}>
              {isLoading ? (
                <div>
                  <div className={styles.projectSkeleton}>
                    <Skeleton active />
                  </div>
                </div>
              ) : null}
              {!isSSOLogin && !isLoading ? (
                <HLayout noPadding={true} gap={16} style={{ width: "100%" }}>
                  <InputWithOuterLabel
                    name="firstName"
                    labelText={t("settings.form.first_name")}
                    mandatory={true}
                    placeholder="John"
                    text={user?.firstName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateUser(e, "firstName")}
                    disabled
                  />
                  <InputWithOuterLabel
                    name="lastName"
                    labelText={t("settings.form.last_name")}
                    mandatory={true}
                    placeholder="Doe"
                    text={user?.lastName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateUser(e, "lastName")}
                    disabled
                  />
                </HLayout>
              ) : null}
              {isSSOLogin && !isLoading ? (
                <InputWithOuterLabel
                  name="fullName"
                  labelText={t("settings.form.full_name")}
                  mandatory={true}
                  placeholder="John Doe"
                  text={`${user?.firstName} ${user?.lastName}`}
                  disabled
                />
              ) : null}
              {!isLoading ? (
                <InputWithOuterLabel
                  name="email"
                  labelText={t("settings.form.email")}
                  mandatory={true}
                  type="email"
                  placeholder="john@doe.com"
                  text={user?.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateUser(e, "email")}
                  disabled
                />
              ) : null}
              {!isPasswordChange && !isSSOLogin && !isLoading ? (
                <VLayout noMargin={true} noFlex={true} gap={8}>
                  <Label labelText={t("settings.form.password")} />
                  <Button
                    htmlType="button"
                    label={t("settings.form.change_password")}
                    style={{ width: "fit-content" }}
                    onClick={() => setIsPasswordChange(true)}
                  />
                </VLayout>
              ) : null}
              {isPasswordChange && (
                <>
                  <InputWithOuterLabel
                    labelText={t("settings.form.old_password")}
                    name="currentPassword"
                    type="password"
                    placeholder="**********"
                    validation={true}
                    text={user?.currentPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateUser(e, "currentPassword")}
                    debounce={250}
                  />
                  <InputWithOuterLabel
                    labelText={t("settings.form.new_password")}
                    name="password"
                    type="password"
                    placeholder="**********"
                    validation={true}
                    text={user?.password}
                    onChange={handlePasswordChange}
                    debounce={250}
                  />
                  <InputWithOuterLabel
                    labelText={t("settings.form.password_confirm")}
                    name="confirmPassword"
                    type="password"
                    placeholder="**********"
                    mandatory={!!user?.confirmPassword}
                    text={user?.confirmPassword}
                    onChange={confirmPassword}
                    debounce={250}
                  />
                  {!isSSOLogin && !isLoading ? (
                    <Button
                      htmlType="submit"
                      loading={isUpdatingPassword}
                      disabled={isDisabled}
                      label={t("settings.save")}
                      style={{ width: "fit-content" }}
                    />
                  ) : null}
                </>
              )}
              {isSSOLogin && !isLoading ? <p>{t("settings.sso_login_desc", { providerName })}</p> : null}

              <pre>{t("settings.tenant_display_text", { tenantId })}</pre>

              <VLayout noMargin={true} gap={8}>
                {!validEmail && <p className={styles.Error}>{t("settings.errors.invalid_email")}</p>}
                {!matchedPassword && <p className={styles.Error}>{t("settings.errors.password_not_match")}</p>}
                {!isPasswordNotOld ? <p className={styles.Error}>{t("settings.errors.password_same_as_old")}</p> : null}
              </VLayout>
            </VLayout>
          </form>
        </div>
      </div>
    </HLayout>
  );
};

export default ProfileAndSecurity;
