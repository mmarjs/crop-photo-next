import styles from "./breadcrumbs.module.scss";
import { Breadcrumb } from "antd";
import classnames from "classnames";
import Link from "next/link";
import { BreadcrumbDividerIcon } from "../../assets";

export type BreadcrumbProps = {
  /**
   * Array of Array[Page Name, Link to Page]
   * value[1] is href and value[0] is the breadcrumb name
   * if u want to disable(make it non clickable) a breadcrumb don't send href(value[1]) at all
   */
  pathArray: Array<Array<string>>;
  /**
   * css styling object for inner breadcrumb class
   */
  className?: string;
  /**
   * css styling object for outer div
   */
  bcContainerClassName?: string;
};

export function Breadcrumbs({ pathArray, className, bcContainerClassName }: BreadcrumbProps) {
  return (
    <div className={bcContainerClassName ? classnames(bcContainerClassName) : styles.outerBreadcrumbContainer}>
      <Breadcrumb
        separator={<BreadcrumbDividerIcon className={styles.nextIcon} />}
        className={className ? classnames(className) : styles.breadcrumbContainer}
      >
        {pathArray.map((value, idx) => (
          <Breadcrumb.Item key={idx}>
            {value[1] ? (
              <Link href={value[1] ? value[1] : ""} passHref>
                <div className={styles.breadcrumbValueRedirect}>{value[0]}</div>
              </Link>
            ) : (
              <div className={styles.breadcrumbValue}>{value[0]}</div>
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  );
}
