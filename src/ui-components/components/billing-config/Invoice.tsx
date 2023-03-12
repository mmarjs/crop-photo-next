import React from "react";
import styles from "../../../styles/InvoiceList.module.css";

export default class InvoiceListItem extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {};
  }

  render() {
    let downloadIcon = () => (
      <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.99984 11.3346C5.88935 11.3346 5.78378 11.2889 5.70817 11.2083L0.883171 6.38333C0.804291 6.3051 0.759922 6.1986 0.759922 6.0875C0.759922 5.9764 0.804291 5.8699 0.883171 5.79167L1.04984 5.625C1.12823 5.54362 1.23685 5.49836 1.34984 5.5H3.49984V0.916667C3.49984 0.686548 3.68639 0.5 3.9165 0.5H8.08317C8.31329 0.5 8.49984 0.686548 8.49984 0.916667V5.5H10.6498C10.7628 5.49836 10.8714 5.54362 10.9498 5.625L11.1165 5.79167C11.1954 5.8699 11.2398 5.9764 11.2398 6.0875C11.2398 6.1986 11.1954 6.3051 11.1165 6.38333L6.2915 11.2083C6.21589 11.2889 6.11033 11.3346 5.99984 11.3346ZM11.8332 14.25V13.4167C11.8332 13.1865 11.6466 13 11.4165 13H0.583171C0.353052 13 0.166504 13.1865 0.166504 13.4167V14.25C0.166504 14.4801 0.353052 14.6667 0.583171 14.6667H11.4165C11.6466 14.6667 11.8332 14.4801 11.8332 14.25Z"
          fill="#061425"
        />
      </svg>
    );
    let openInvoice = () => (
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.8335 10.5V2.16667C15.8335 1.24619 15.0873 0.5 14.1668 0.5H2.50016C1.57969 0.5 0.833496 1.24619 0.833496 2.16667V10.5C0.833496 11.4205 1.57969 12.1667 2.50016 12.1667H14.1668C15.0873 12.1667 15.8335 11.4205 15.8335 10.5ZM2.50016 3.83333H14.1668V10.5H2.50016V3.83333ZM17.5002 12.1667V3.83333C18.4206 3.83333 19.1668 4.57952 19.1668 5.5V12.1667C19.1668 14.0076 17.6744 15.5 15.8335 15.5H5.8335C4.91302 15.5 4.16683 14.7538 4.16683 13.8333H15.8335C16.754 13.8333 17.5002 13.0871 17.5002 12.1667Z"
          fill="#061425"
        />
      </svg>
    );

    let { date, status, amount } = this.props;

    return (
      <div className={styles.invoiceContainer}>
        <div className={styles.invoiceTextContainer}>
          <div className={styles.date}>
            <span>{date}</span>
          </div>
          <div className={styles.status}>
            <img
              className={styles.statusIcon}
              src={status === "Paid" ? "/images/green-icon.svg" : "/images/orange-icon.svg"}
            />
            <span style={{ paddingLeft: "2px", position: "static" }}>{status}</span>
          </div>
          <div className={styles.amount}>
            <span>{amount}</span>
          </div>
        </div>

        <div className={styles.icons}>
          <img className={styles.downloadIcon} src={"/images/download-icon.svg"} />
          <img className={styles.openInvoice} src={"/images/openinvoice-icon.svg"} />
        </div>
      </div>
    );
  }
}
