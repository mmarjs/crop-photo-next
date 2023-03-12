import { useState } from "react";
import Card from "./card";
import styles from "./loading-cards.module.scss";

const LoadingCards = ({ status, jobId }: { status: string; jobId: string }) => {
  const [runningIndex, setRunningIndex] = useState(0);

  return (
    <div className={styles.loadingWrapper}>
      <Card
        runningIndex={runningIndex}
        jobId={jobId}
        onSetRunningIndex={(index: number) => {
          setRunningIndex(index);
        }}
        status={status}
      />
    </div>
  );
};

export default LoadingCards;
