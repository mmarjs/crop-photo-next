import styles from "./card.module.scss";
import IconAmazon from "../../../assets/icons/icon-amazon-orange.svg";
import IconPhoto from "../../../assets/icons/icon-photo.svg";
import IconNote from "../../../assets/icons/icon-note-active.svg";
import IconExpand from "../../../assets/icons/icon-expand-active.svg";
import IconBox from "../../../assets/icons/icon-box-active.svg";
import IconIncrease from "../../../assets/icons/icon-increase.svg";
import IconCheck from "../../../assets/icons/icon-check-circle.svg";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OBJECT_TYPE, QCJobStatus } from "../../../../common/Types";
import classNames from "classnames";

import { motion } from "framer-motion";
import { Progress } from "antd";
import useInterval from "../../../../hooks/useInterval";
import _ from "lodash";
import useMediaQuery from "../../../../hooks/useMediaQuery";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";

// import { useInterval } from 'usehooks-ts'

const cardData: OBJECT_TYPE[] = [
  {
    id: "photography",
    icon: <IconPhoto />,
    title: "Photography",
    // score: 12,
    // increase: 36,
    active: false,
    // xOffset: "-13.4375rem"
    xOffset: "-13.4375rem",
    yOffset: "-13.4375rem"
  },
  {
    id: "dimensions",
    icon: <IconExpand />,
    title: "Dimension",
    // score: 15,
    // increase: 21,
    active: false,
    // xOffset: "-23.4375rem"
    xOffset: "-17.4375rem",
    yOffset: "-17.4375rem"
  },
  {
    id: "data_and_category",
    icon: <IconBox />,
    title: "Data and Category",
    // score: 32,
    // increase: 53,
    active: false,
    // xOffset: "-33.4375rem"
    xOffset: "-20.4375rem",
    yOffset: "-20.4375rem"
  },
  {
    id: "policies",
    icon: <IconNote />,
    title: "Policies",
    // score: 56,
    // increase: 32,
    active: false,
    // xOffset: "-42.4375rem"
    xOffset: "-25.4375rem",
    yOffset: "-25.4375rem"
  }
];

const Card = ({
  runningIndex,
  onSetRunningIndex,
  status,
  jobId
}: {
  runningIndex: number;
  onSetRunningIndex: (index: number) => void;
  status: string;
  jobId: string;
}) => {
  const [loadingAnimComplete, setLoadingAnimComplete] = useState<boolean>(false);

  useEffect(() => {
    if (runningIndex === 3 && status === QCJobStatus.IN_PROGRESS) {
      setLoadingAnimComplete(true);
    }
  }, [runningIndex, status]);

  const isMedium = useMediaQuery("(min-width: 1044.98px)");

  const cardMapvariant = isMedium
    ? useMemo(() => {
        return cardData.map((card, i) => {
          return {
            hidden: {
              x: card.xOffset
            },
            shrink: {
              maxWidth: ["8.6rem", "3.3613rem", "3.3613rem", "3.3613rem"],
              minWidth: ["8.6rem", "3.3613rem", "3.3613rem", "3.3613rem"],
              height: ["9.1113rem", "3.3613rem", "3.3613rem", "3.3613rem"],
              x: ["0rem", "0rem", "0rem", card.xOffset],
              opacity: [1, 1, 1, 0],
              transition: {
                duration: 2,
                delay: 1 * i
              }
            },
            visible: {
              x: 0
            }
          };
        });
      }, [cardData])
    : useMemo(() => {
        return cardData.map((card, i) => {
          return {
            hidden: {
              y: card.yOffset
            },
            shrink: {
              maxWidth: ["8.6rem", "3.3613rem", "3.3613rem", "3.3613rem"],
              minWidth: ["8.6rem", "3.3613rem", "3.3613rem", "3.3613rem"],
              height: ["9.1113rem", "3.3613rem", "3.3613rem", "3.3613rem"],
              x: ["0rem", "0rem", "0rem", card.xOffset],
              opacity: [1, 1, 1, 0],
              transition: {
                duration: 2,
                delay: 1 * i
              }
            },
            visible: {
              y: 0
            }
          };
        });
      }, [cardData]);

  const handleNextIndex = useCallback(() => {
    const nextIndex = runningIndex + 1;
    if (nextIndex <= cardData.length - 1) {
      onSetRunningIndex(nextIndex);
    }
  }, [runningIndex]);

  return (
    <>
      <div className={styles.cardOrange}>
        {/* <IconAmazon className={styles.IconAmazon} /> */}
        <div className={styles.marketplace}>Amazon</div>
        <div className={styles.scoreHeading}>
          <LoadingOutlined style={{ marginRight: "0.5rem" }} />
          {!loadingAnimComplete ? `Evaluating Criteria` : `Finalizing your report`}
        </div>
      </div>
      {cardData.map((card, i) => (
        <RunningCard
          key={card.id}
          runningVariant={cardMapvariant[runningIndex]}
          card={card}
          isRunning={i === runningIndex}
          onSetRunningIndex={handleNextIndex}
          status={status}
          runningIndex={runningIndex}
          jobId={jobId}
        />
      ))}

      <div className={styles.cardBottom}> </div>
    </>
  );
};

const cardTextVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const RunningCard = ({
  runningVariant,
  card,
  isRunning,
  onSetRunningIndex,
  status,
  runningIndex,
  jobId
}: {
  runningVariant: any;
  card: any;
  isRunning: boolean;
  onSetRunningIndex: () => void;
  status: string;
  runningIndex: number;
  jobId: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isScoreLoaded, setIsScoreLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  let router = useRouter();

  useEffect(() => {
    if (status === QCJobStatus.SUCCESS) {
      router.push(`/listing-analyzer/report?jobId=${jobId}`);
    }
  }, [runningIndex, status, progress]);

  useInterval(
    () => {
      if (isRunning) {
        setProgress(progress => progress + 1);
      }
    },
    progress < 100 ? 100 : null
  );

  useEffect(() => {
    let expandId: any = null;
    let runningId: any = null;
    if (progress >= 100) {
      setIsScoreLoaded(true);
      runningId = setTimeout(() => {
        setProgress(0);

        onSetRunningIndex();
      }, 1000);
    }
    return () => {
      // clearTimeout(expandId);
      clearTimeout(runningId);
      // setProgress(0)
    };
  }, [progress]);

  return (
    <>
      <motion.div
        layout
        variants={runningVariant}
        initial={"hidden"}
        // animate={isExpanded ? "visible" : "shrink"}
        animate={"visible"}
        transition={{ duration: 1.5, type: "spring" }}
        className={classNames(styles.regularCard, { [styles.active]: true })}
      >
        <div style={{ padding: "0.8975rem 0.8975rem 0 0.8975rem" }}>
          {/* TODO: add color conditionally to class */}
          <motion.div className={classNames(styles.icons)}>{card.icon}</motion.div>
          {
            // isExpanded &&
            <>
              <div className={styles.title}>{card.title}</div>
              {/* <div className={styles.scoreHeadingRegular}>Score</div> */}
            </>
          }
          {isScoreLoaded && (
            <>
              {/* <motion.div
                variants={cardTextVariant}
                initial="hidden"
                // animate={isExpanded ? "visible" : "hidden"}
                animate={"visible"}
                transition={{ duration: 0.5 }}
                layout
                className={styles.scorePercentage}
              >
                {card.score}%
              </motion.div>
              <motion.div
                variants={cardTextVariant}
                initial="hidden"
                // animate={isExpanded ? "visible" : "hidden"}
                animate={"visible"}
                transition={{ duration: 0.2 }}
                layout
                className={styles.scoreImprovement}
              >
                <IconIncrease className={styles.iconIncrease} />
                <span>+{_.round(card.increase)}%</span>
                after Crop.photo
              </motion.div> */}
              {/* <IconCheck className={styles.iconCheck} /> */}
              <CheckCircleOutlined style={{ color: "#00b047", marginTop: "1rem", fontSize: "1rem" }} />
            </>
          )}
        </div>
        {!isScoreLoaded && (
          <div className={styles.progressBar}>
            <Progress strokeColor={"#0038FF"} strokeWidth={8} percent={progress} showInfo={false} />
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Card;
