import React, { SetStateAction } from "react";
import { InputWithLabel } from "../../composite/input-with-label";
import { Checkbox } from "../../checkbox";
import styles from "./modal-content.module.scss";
import { IduplicateCheckBox } from "../project-card";
import { useTranslation } from "react-i18next";

type RenameModalContentProps = {
  setProjectName: React.Dispatch<SetStateAction<string>>;
  projectName: string;
  onEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  errorMessage: string;
};
type DuplicateModalContentProps = {
  duplicateCheckBox: IduplicateCheckBox;
  setDuplicateCheckBox: React.Dispatch<SetStateAction<IduplicateCheckBox>>;
  errorMessage: string;
  automationType: "SMART_CROP" | "REMOVE_BG_RESIZE" | "UNRECOGNIZABLE_CROP";
};
type DeleteModalContentProps = {
  deleteConfirm: string;
  setDeleteConfirm: React.Dispatch<SetStateAction<string>>;
  errorMessage: string;
  onEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const RenameModalContent = ({ setProjectName, projectName, onEnter, errorMessage }: RenameModalContentProps) => {
  return (
    <>
      <InputWithLabel
        labelText="Enter new name"
        labelPosition="TOP"
        text={projectName}
        inputAsMandatory={true}
        onPressEnter={onEnter}
        OnChangeOfInputValue={(e: React.ChangeEvent<HTMLInputElement>) => {
          setProjectName(e.target.value);
        }}
        focusOnEnd={true}
      />
      {errorMessage && <span className={styles.errorText}>{errorMessage}</span>}
    </>
  );
};

export const DuplicateModalContent = ({
  duplicateCheckBox,
  setDuplicateCheckBox,
  errorMessage,
  automationType
}: DuplicateModalContentProps) => {
  const automationTypeMap = {
    SMART_CROP: "smart crop",
    REMOVE_BG_RESIZE: "smart resize + background remove",
    UNRECOGNIZABLE_CROP: "unrecognizable face crop"
  };

  const { t } = useTranslation();

  return (
    <>
      <p className={styles.duplicatePara}>
        {t("home.duplicate_desc", {
          automationType: automationTypeMap[automationType as "SMART_CROP" | "REMOVE_BG_RESIZE" | "UNRECOGNIZABLE_CROP"]
        })}
      </p>
      <div className={styles.duplicateCheckBoxWrapper}>
        <Checkbox
          text="Duplicate configuration"
          onChange={e => setDuplicateCheckBox({ ...duplicateCheckBox, duplicate_configuration: e.target.checked })}
          checked={duplicateCheckBox.duplicate_configuration}
          className={styles.checkBox}
        />
        <br />
        <Checkbox
          text="Duplicate media"
          onChange={e => setDuplicateCheckBox({ ...duplicateCheckBox, duplicate_media: e.target.checked })}
          checked={duplicateCheckBox.duplicate_media}
          className={styles.checkBox}
        />
      </div>
      {errorMessage && <span className={styles.errorText}>{errorMessage}</span>}
    </>
  );
};

export const DeleteModalContent = ({
  deleteConfirm,
  setDeleteConfirm,
  errorMessage,
  onEnter
}: DeleteModalContentProps) => {
  return (
    <>
      <p>You will not be able to restore this project in any way. Enter delete below to confirm your delete</p>
      <InputWithLabel
        labelText="Enter delete"
        labelPosition="TOP"
        placeHolderText="delete"
        text={deleteConfirm}
        inputAsMandatory={true}
        OnChangeOfInputValue={(e: React.ChangeEvent<HTMLInputElement>) => {
          setDeleteConfirm(e.target.value);
        }}
        focusOnEnd={true}
        onPressEnter={onEnter}
      />
      {errorMessage && <span className={styles.errorText}>{errorMessage}</span>}
    </>
  );
};
