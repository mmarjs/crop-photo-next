import styles from "./heading.module.scss";

const Heading = () => {
  return (
    <>
      <p className={styles.heading}>
        Generating<span className={styles.colorText}> &nbsp;Report </span>
      </p>
      <div className={styles.subheading}>
        <div>
          Our report is detailed and complete, so&nbsp;<span className={styles.boldText}>it may take some time</span>
          &nbsp;to review your photos.
        </div>
        {/* <div>You can wait here or continue using Crop.Photo.</div> */}
      </div>
      {/* <div className={styles.buttonCTA}>Continue Using Crop.photo</div> */}
    </>
  );
};

export default Heading;
