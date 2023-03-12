import { useState, KeyboardEventHandler, ChangeEventHandler, SyntheticEvent } from "react";
import styles from "./search-input.module.scss";
import { Input as AntInput, Button } from "antd";
import classnames from "classnames";
import { toast } from "../toast";
import { useTranslation } from "react-i18next";

export type SearchInputProps = {
  /**
   * SEARCH ON CHANGE OF THE VALUE
   */
  onChange?: (value: string) => void;
  /**
   * SEARCH ON Enter Key
   */
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
  /**
   * RESET Search field
   */
  onClear?: () => void;
  /**
   * class name for search input
   */
  className?: string;
};

export function SearchInput({ onChange, onPressEnter, onClear, className }: SearchInputProps) {
  const [searchValue, setSearchValue] = useState("");
  const { t } = useTranslation();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  const resetSearchField = () => {
    setSearchValue("");
    if (onClear) {
      onClear();
    }
  };

  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchValue && searchValue.length > 1 && onPressEnter) {
      onPressEnter(e);
    } else {
      toast(t("home.filter.error"), "error");
    }
  };

  return (
    <div className={classnames(styles.searchInput, className)}>
      <AntInput
        prefix={<img src="/images/search.svg" />}
        suffix={
          searchValue ? (
            <Button className={styles.clearSearch} onClick={resetSearchField}>
              <img src="/images/cross.svg" />
            </Button>
          ) : (
            ""
          )
        }
        value={searchValue}
        placeholder={t("home.search_placeholder")}
        onPressEnter={handlePressEnter}
        onChange={handleSearchInput}
      />
    </div>
  );
}
