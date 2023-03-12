import { ChangeEvent, FormEvent, MouseEvent, MouseEventHandler, useState } from "react";
import { Button } from "../button";
import { DownloadForm } from "../download-form";
import { HLayout } from "../hLayout";
import { InputWithOuterLabel } from "../input";
import { Steps } from "../steps";
import { VLayout } from "../vLayout";
import styles from "./export-form.module.scss";

type ExportFormProps = {
  images: number[];
  onOK?: (e: MouseEvent<HTMLElement>) => void;
  onCancel?: (e: MouseEvent<HTMLElement>) => void;
};

const ExportForm = ({ images, onOK, onCancel }: ExportFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [s3Link, setS3Link] = useState("");
  const [s3AccessId, setS3AccessId] = useState("");
  const [s3SecretKey, setS3SecretKey] = useState("");

  const onSettingFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  return (
    <VLayout noMargin={true}>
      <div className={styles.Stepper}>
        <Steps labels={["Select format", "S3 Settings", "Export"]} currentStep={currentStep} />
      </div>
      {currentStep === 0 && <DownloadForm onOK={() => setCurrentStep(1)} okText="Next" onCancel={onCancel} />}
      {currentStep === 1 && (
        <form className={styles.S3SettingForm} onSubmit={onSettingFormSubmit}>
          <VLayout noMargin={true} gap={24}>
            <VLayout noMargin={true} gap={8}>
              <InputWithOuterLabel
                name="s3Link"
                text={s3Link}
                type="text"
                labelText="Enter S3 link"
                placeholder="https://s3.amazonaws.com/"
                mandatory={true}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setS3Link(e.target.value)}
              />
              <p className={styles.InfoS3Link}>
                Enter the full path to a folder if you want the assets transferred to that folder.
              </p>
            </VLayout>
            <InputWithOuterLabel
              name="s3AccessId"
              text={s3AccessId}
              type="text"
              labelText="S3 access ID"
              placeholder="Enter your access id"
              mandatory={true}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setS3AccessId(e.target.value)}
            />
            <VLayout noMargin={true} gap={48}>
              <InputWithOuterLabel
                name="s3SecretKey"
                text={s3SecretKey}
                type="text"
                labelText="S3 secret access key"
                placeholder="Enter your secret access key id"
                mandatory={true}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setS3SecretKey(e.target.value)}
              />
              <HLayout noPadding={true} noFlex={true} hAlign="space-between">
                <Button type="text" htmlType="button" onClick={() => setCurrentStep(0)}>
                  Prev
                </Button>
                <HLayout noPadding={true} gap={16}>
                  <Button type="primary" htmlType="submit">
                    Next
                  </Button>
                  <Button type="text" htmlType="button" onClick={onCancel}>
                    Cancel
                  </Button>
                </HLayout>
              </HLayout>
            </VLayout>
          </VLayout>
        </form>
      )}
      {currentStep === 2 && (
        <VLayout noMargin={true} gap={24} className={styles.ReviewForm}>
          <h5 className={styles.SummaryTitle}>Summary</h5>
          <p className={styles.SummaryDescription}>
            We will transfer {images.length} assets to the following S3 bucket
          </p>
          <VLayout noMargin={true} gap={8}>
            <h6 className={styles.FieldLabel}>S3 link</h6>
            <p className={styles.FieldValue}>{s3Link}</p>
          </VLayout>
          <VLayout noMargin={true} gap={8}>
            <h6 className={styles.FieldLabel}>S3 access ID</h6>
            <p className={styles.FieldValue}>{s3AccessId}</p>
          </VLayout>
          <VLayout noMargin={true} gap={48}>
            <VLayout noMargin={true} gap={8}>
              <h6 className={styles.FieldLabel}>S3 secret access key</h6>
              <p className={styles.FieldValue}>***************************** {s3SecretKey.slice(-5)}</p>
            </VLayout>
            <HLayout noPadding={true} noFlex={true} hAlign="space-between">
              <Button type="text" onClick={() => setCurrentStep(1)}>
                Prev
              </Button>
              <HLayout noPadding={true} gap={16}>
                <Button type="primary" onClick={onOK}>
                  Start transfer
                </Button>
                <Button type="text" onClick={onCancel}>
                  Cancel
                </Button>
              </HLayout>
            </HLayout>
          </VLayout>
        </VLayout>
      )}
    </VLayout>
  );
};

export default ExportForm;
