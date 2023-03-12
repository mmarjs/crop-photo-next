import { Logger } from "aws-amplify";
import { Dispatch, SetStateAction } from "react";
import Data from "../pages/user/settings/data";
import { toast } from "../ui-components/components/toast";
import { StringUtil } from "../ui-components/utils";

export default class BillingController {
  static logger: Logger = new Logger("controller:BillingController");
  static payment(stripe: any, elements: any, returnUrl: string) {
    return new Promise((resolve, reject) => {
      this.logger.debug(`stripe value: ${stripe} and elements value ${elements}`);
      // We don't want to let default form submission happen here,
      // which would refresh the page.
      //event.preventDefault();

      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }

      stripe
        .confirmPayment({
          //`Elements` instance that was used to create the Payment Element
          elements,
          confirmParams: {
            return_url: returnUrl
          }
        })
        .then(
          (resp: any) => {
            this.logger.debug("stripe payment is successful", resp);
            if (resp?.paymentIntent?.status == "succeeded") {
              console.log("PAYMENT Success");
              resolve(resp);
            } else if (resp?.error?.type === "card_error" || resp?.error?.type === "validation_error") {
              toast(resp?.error?.message, "error");
              reject(resp);
            } else {
              toast("An unexpected error occurred.", "error");
              reject(resp);
            }
            resolve(resp);
          },
          (error: unknown) => {
            this.logger.error("stripe payment is failed with some error", error);
            reject(error);
          }
        )
        .catch((error: unknown) => {
          this.logger.error("stripe payment is failed with some error", error);
          //  This point will only be reached if there is an immediate error when
          //     confirming the payment. Show error to your customer (for example, payment
          //     details incomplete)
          //     setErrorMessage(data.error.message);
        });
    });
  }
  static addCredits(stripe: any, elements: any, returnUrl: string, cs: string) {
    return new Promise((resolve, reject) => {
      this.logger.debug(`Adding Credits : stripe value: ${stripe} and elements value ${elements}`);

      if (!stripe || !elements) {
        this.logger.debug(`Add credit call is failed as stripe value is ${stripe} or elements value is ${elements}`);
        resolve({ error: "Add credit call is failed as stripe value is null or elements value is null" });
      }

      stripe
        .confirmCardPayment(cs)
        .then((resp: any) => {
          console.log("handleCardAction : ", resp);
          if (resp?.paymentIntent?.status == "succeeded") {
            console.log("PAYMENT Success");
            resolve(resp);
          } else if (resp?.error?.type === "card_error" || resp?.error?.type === "validation_error") {
            toast(resp?.error?.message, "error");
            reject(resp);
          } else {
            toast("An unexpected error occurred.", "error");
            reject(resp);
          }
        })
        .catch((resp: any) => {
          console.log("handleCardAction rejected: ", resp);
          reject(resp);
        });
    });
  }

  static addCard(stripe: any, elements: any, returnUrl: string) {
    return new Promise((resolve, reject) => {
      this.logger.debug(`stripe value: ${stripe} and elements value ${elements}`);
      // We don't want to let default form submission happen here,
      // which would refresh the page.
      //event.preventDefault();

      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        return;
      }

      // props.payClick(stripe, elements);
      //setModalButtonLoading && setModalButtonLoading(true);

      stripe
        .confirmSetup({
          //`Elements` instance that was used to create the Payment Element
          elements,
          confirmParams: {
            return_url: returnUrl
          }
        })
        .then((resp: any) => {
          console.log("add card : ", resp);
          if (resp?.paymentIntent?.status == "succeeded") {
            console.log("Add card Success");
            resolve(resp);
          } else if (resp?.error?.type === "card_error" || resp?.error?.type === "validation_error") {
            console.log("removing price id from local storage", localStorage.getItem("SUBSCRIPTION_PRICE_ID"));
            localStorage.removeItem("SUBSCRIPTION_PRICE_ID");
            if (StringUtil.isNotEmpty(resp?.error?.decline_code)) {
              let errorMsg: string = this.handleErrorCodes(resp?.error?.decline_code);
              if (StringUtil.isNotEmpty(errorMsg)) {
                toast(errorMsg, "error");
                reject(errorMsg);
              } else {
                toast(resp?.error?.message, "error");
                reject(resp?.error?.message);
              }
            } else {
              toast(resp?.error?.message, "error");
              reject(resp?.error?.message);
            }
          } else {
            localStorage.removeItem("SUBSCRIPTION_PRICE_ID");
            toast("An unexpected error occurred.", "error");
            reject(resp?.error?.message);
          }
        });

      // if (data.error) {
      //   // This point will only be reached if there is an immediate error when
      //   // confirming the payment. Show error to your customer (for example, payment
      //   // details incomplete)
      //   //setErrorMessage(data.error.message);
      //   toast(data?.error.message, "error")
      // } else {
      //   console.log(data);
      //   // Your customer will be redirected to your `return_url`. For some payment
      //   // methods like iDEAL, your customer will be redirected to an intermediate
      //   // site first to authorize the payment, then redirected to the `return_url`.
      // }
      // setModalButtonLoading && setModalButtonLoading(false);
    });
  }

  static handleErrorCodes(declineCode: string) {
    switch (declineCode) {
      case "lost_card":
        return "Your card has been declined. Please use another card or reach out to your card customer service.";

      default:
        return "";
    }
  }
}
