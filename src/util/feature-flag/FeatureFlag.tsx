import * as React from "react";
import { JSON_TYPE } from "../../common/Types";

type FeatureGroup = {
  [groupname: string]: JSON_TYPE;
};

export type FeatureFlags = FeatureGroup | JSON_TYPE;

const FeatureFlagsContext = React.createContext<FeatureGroup | JSON_TYPE>({});

function transformFlags(features: FeatureFlags) {
  if (!Array.isArray(features)) return features;
  return Object.fromEntries(features.map(feature => [feature, true]));
}

function mergeFeatures(groupA: FeatureGroup | JSON_TYPE, groupB: FeatureGroup | JSON_TYPE): FeatureGroup | JSON_TYPE {
  return { ...groupA, ...groupB };
}

export function FlagsProvider({
  features = {},
  children
}: {
  features?: FeatureFlags | JSON_TYPE;
  children: React.ReactNode;
}) {
  const currentFeatures = useFeatures();
  return (
    <FeatureFlagsContext.Provider value={mergeFeatures(transformFlags(currentFeatures), transformFlags(features))}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// Custom Hook API
export function useFeatures(): FeatureGroup | JSON_TYPE {
  return React.useContext(FeatureFlagsContext);
}

// Custom Hook API
export function useFeature(name: string): FeatureGroup | JSON_TYPE {
  const features = useFeatures();
  return name.split(".").reduce<JSON_TYPE | FeatureGroup>((featureGroup, featureName: string) => {
    if (featureGroup[featureName] === undefined) return false;
    return featureGroup[featureName];
  }, features);
}

// Render Prop API
export function Feature({
  name,
  children,
  render = children
}: {
  name: string;
  children?: React.ReactNode | ((hasFeature: JSON_TYPE) => JSX.Element);
  render?: React.ReactNode | ((hasFeature: JSON_TYPE) => JSX.Element);
}) {
  const hasFeature = useFeature(name);
  console.log("appConfig hasFeature", hasFeature, name);
  if (typeof render === "function") return render(hasFeature);
  if (!hasFeature) return null;
  return render;
}

// High Order Component API
export function withFeature(featureName: string) {
  return (Component: Function) => (props: React.ComponentProps<any>) => {
    return (
      <Feature name={featureName}>
        <Component {...props} />
      </Feature>
    );
  };
}
