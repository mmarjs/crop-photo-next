/* eslint-disable @next/next/no-img-element */
import { MutableRefObject, useEffect, useRef } from "react";

import { useKeenSlider, KeenSliderInstance, KeenSliderPlugin } from "keen-slider/react";
import Grid from "antd/lib/grid";
import classNames from "classnames";
import {
  useGetHasNextImage,
  useGetHasPrevImage,
  useGetSampleImageIndexes,
  useGetSelectedSampleImage,
  useResetSampleImage,
  useSampleImages,
  useUpdateSelectedSampleImage
} from "../jotai/atomQueries";
import { SampleCropImage } from "../jotai/atomTypes";
import { Button } from "../../components/button";

import styles from "./CropImageSlider.module.scss";
import "react-multi-carousel/lib/styles.css";
import "keen-slider/keen-slider.min.css";
import { useUpdateSelectedSampleImageStatus } from "../jotai";

const { useBreakpoint } = Grid;

function ThumbnailPlugin(mainRef: MutableRefObject<KeenSliderInstance | null>): KeenSliderPlugin {
  return slider => {
    function removeActive() {
      slider.slides.forEach(slide => {
        slide.classList.remove("active");
      });
    }
    function addActive(idx: number) {
      slider.slides[idx].classList.add("active");
    }

    function addClickEvents() {
      slider.slides.forEach((slide, idx) => {
        slide.addEventListener("click", () => {
          if (mainRef.current) mainRef.current.moveToIdx(idx);
        });
      });
    }

    slider.on("created", () => {
      if (!mainRef.current) return;
      addActive(slider.track.details.rel);
      addClickEvents();
      mainRef.current.on("animationStarted", main => {
        removeActive();
        const next = main.animator.targetIdx || 0;
        addActive(main.track.absToRel(next));
        slider.moveToIdx(next);
      });
    });
  };
}
export default function CropImageSlider() {
  const screens = useBreakpoint();
  const carouselRef = useRef();
  const [sampleImages] = useSampleImages();
  const { entries } = sampleImages;
  const [, updateSelectedImage] = useUpdateSelectedSampleImage();
  const [selectedSampleImage] = useGetSelectedSampleImage();
  const [[currentIndex, nextIndex, prevIndex]] = useGetSampleImageIndexes();
  const hasNext = useGetHasNextImage();
  const hasPrev = useGetHasPrevImage();
  const [, updateSelectedImageStatus] = useUpdateSelectedSampleImageStatus();
  const resetSampleImage = useResetSampleImage();

  const [ref, instanceRef] = useKeenSlider<HTMLDivElement>({
    breakpoints: {
      "(min-width: 768px)": {
        slides: { perView: 3, spacing: 10 }
      },
      "(min-width: 1280px)": {
        slides: { perView: 7, spacing: 4 }
      }
    }
  });

  useEffect(() => {
    if (!!sampleImages && !!entries && entries?.length > 0) {
      updateSelectedImage(entries[0]);
    }
    return () => {
      resetSampleImage();
    };
  }, [entries, resetSampleImage, sampleImages, updateSelectedImage]);

  const handleNext = () => {
    if (hasNext && !!entries) {
      updateSelectedImageStatus(false);
      updateSelectedImage(entries[nextIndex as number]);
      !!instanceRef.current && instanceRef.current.moveToIdx(nextIndex as number);
    }
  };

  const handlePrev = () => {
    if (hasPrev && !!entries) {
      updateSelectedImageStatus(false);
      updateSelectedImage(entries[prevIndex as number]);
      !!instanceRef.current && instanceRef.current.moveToIdx(prevIndex as number);
    }
  };

  return (
    <div className={styles.CropImageSlider}>
      <div ref={ref} className="keen-slider">
        {entries?.map((sampleImage: SampleCropImage) => (
          <SampleImage key={sampleImage.id} sampleImage={sampleImage} />
        ))}
      </div>

      <div className={styles.navigationButtons}>
        <Button
          icon={<img src="/images/prev-icon.svg" alt="prev button" width={5} height={10} />}
          onClick={handlePrev}
          disabled={!hasPrev}
        />
        <Button
          icon={<img src="/images/next-icon.svg" alt="next button" width={5} height={10} />}
          onClick={handleNext}
          disabled={!hasNext}
        />
      </div>
    </div>
  );
}

const SampleImage = ({ sampleImage }: { sampleImage: SampleCropImage }) => {
  const [selectedImage, updateSelectedImage] = useUpdateSelectedSampleImage();
  const [selectedSampleImage] = useGetSelectedSampleImage();
  const [, updateSelectedImageStatus] = useUpdateSelectedSampleImageStatus();

  return (
    <div
      className={classNames("keen-slider__slide")}
      style={{ padding: 6 }}
      onClick={() => {
        if (sampleImage.id === selectedImage?.id) return;
        updateSelectedImage(sampleImage);
        updateSelectedImageStatus(false);
      }}
      onDoubleClick={() => {}}
    >
      <div
        className={classNames(styles.sampleCropImage, {
          [styles.selectedSampleImage]: selectedSampleImage?.id === sampleImage?.id
        })}
      >
        <img src={sampleImage.signed_s3_url} className={styles.variantImage} alt="#" />
      </div>
    </div>
  );
};
