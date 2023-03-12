import { Photo, RawPhoto } from "./Types";

export const getName = (photoUrl: string) => {
  const segments = photoUrl.split("?")[0].split("/");
  return segments[segments.length - 1];
};

export const getPhoto = (rawPhoto: RawPhoto): Photo => {
  return {
    id: rawPhoto.id,
    name: getName(rawPhoto.src.large2x),
    imageUrl: rawPhoto.src.large2x,
    thumbnailUrl: rawPhoto.src.small
  };
};
