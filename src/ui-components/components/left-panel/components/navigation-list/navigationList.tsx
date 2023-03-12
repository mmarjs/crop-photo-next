import classnames from "classnames";
import { PrimaryButton, ButtonProps } from "../../../button";
import styles from "./navigationList.module.scss";

export type NavigationListItemProps = ButtonProps & {
  selected: boolean;
};

export type NavigationListProps = {
  /**
   * Navigation List Array
   */
  navigationList: Array<NavigationListItemProps>;
  bottomItems: Array<React.ReactNode>;
};

export function NavigationListItem(item: NavigationListItemProps) {
  return (
    <PrimaryButton
      id={styles.navigationButton}
      key={item.label}
      className={classnames(item.className, item.selected ? styles.selected : "")}
      icon={item.icon}
      label={item.label}
      onClick={item.onClick}
    />
  );
}

//TO-DO: Need to make this component proper to take items as props. Before that required an unified Image component
export function NavigationList({ navigationList = [], bottomItems = [] }: NavigationListProps) {
  return (
    <div className={styles.navigationContainer}>
      {navigationList.map(item => {
        return <NavigationListItem key={item.label} {...item} />;
      })}
      <div className={styles.bottomItems}>
        {bottomItems.map(function (item, index) {
          return item;
        })}
      </div>
    </div>
  );
}
