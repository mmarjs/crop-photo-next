import { MouseEvent } from "react";
import { Button } from "../button";
import styles from "./data-card.module.scss";

type DataCardProps = {
  title: string;
  description: string;
  buttonText: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
};

const DataCard = ({ title, description, buttonText, onClick }: DataCardProps) => (
  <div className={styles.Wrapper}>
    <h5>{title}</h5>
    <p>{description}</p>
    <Button label={buttonText} onClick={onClick} />
  </div>
);

export default DataCard;
