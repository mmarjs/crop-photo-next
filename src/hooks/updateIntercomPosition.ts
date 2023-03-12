import { useEffect } from "react";
import { useIntercom } from "react-use-intercom";

export default function updateIntercomPosition(position: number = 30, isEnabled: boolean) {
  const { update: updateIntercom } = useIntercom();

  useEffect(() => {
    if (isEnabled && !!position) {
      updateIntercom({
        verticalPadding: position
      });
    }
  }, [isEnabled]);
}
