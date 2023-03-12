import { useState } from "react";
import { NAVIGATION_MENU } from "../../../../common/Enums";
import { HLayout } from "../../../../ui-components/components/hLayout";
import { LeftPanel } from "../../../../ui-components/components/left-panel";
import styles from "../../../../styles/Data.module.css";
import { Breadcrumbs } from "../../../../ui-components/components/breadcrumb";
import { SETTINGS_PAGE, SETTING_AND_DATA_PAGE } from "../../../../lib/navigation/routes";
import { DataCard } from "../../../../ui-components/components/data-card";
import { CustomModal } from "../../../../ui-components/components/modal";
import DeleteData from "../../../../ui-components/components/data-config/DeleteData";
import RemoveAccount from "../../../../ui-components/components/data-config/RemoveAccount";

const Data = () => {
  const [visibleDeleteData, setVisibleDeleteData] = useState(false);
  const [visibleRemoveAccount, setVisibleRemoveAccount] = useState(false);

  const breadcrumbPathArray = [
    ["Settings", SETTINGS_PAGE],
    ["Data", SETTING_AND_DATA_PAGE]
  ];

  const cardData = [
    {
      title: "Delete data",
      description:
        "This will delete your history, impots, integrations, work queue and any preferences you might have set. This is a permanent action that cannot be undone.",
      buttonText: "Delete data",
      onClick: () => setVisibleDeleteData(true)
    },
    {
      title: "Remove my account",
      description:
        "This will delete all your data and remove your account from Evolphin Cloud. This is a permanent action that cannot be undone.",
      buttonText: "Remove my account",
      onClick: () => setVisibleRemoveAccount(true)
    }
  ];

  const Modals = () => (
    <>
      <CustomModal
        title="Delete data"
        visible={visibleDeleteData}
        noFooter={true}
        onCancel={() => setVisibleDeleteData(false)}
      >
        <DeleteData onOK={() => setVisibleDeleteData(false)} onCancel={() => setVisibleDeleteData(false)} />
      </CustomModal>
      <CustomModal
        title="Remove account"
        visible={visibleRemoveAccount}
        noFooter={true}
        onCancel={() => setVisibleRemoveAccount(false)}
      >
        <RemoveAccount onOK={() => setVisibleRemoveAccount(false)} onCancel={() => setVisibleRemoveAccount(false)} />
      </CustomModal>
    </>
  );

  return (
    <HLayout noFlex={true} noPadding={true} hAlign="flex-start" vAlign="unset" style={{ height: "100vh" }}>
      <LeftPanel selectedPage={NAVIGATION_MENU.SETTINGS} />
      <div className={styles.MainContent}>
        <div className={styles.PageBreadcrumb}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>
        <HLayout vAlign="unset" hAlign="unset" grid={true} gap={40} style={{ padding: 40 }}>
          {cardData.map(({ title, description, buttonText, onClick }, idx) => (
            <DataCard key={idx} title={title} description={description} buttonText={buttonText} onClick={onClick} />
          ))}
        </HLayout>
      </div>
      <Modals />
    </HLayout>
  );
};

export default Data;
