import { CropFromConfig } from '../../src/models/CropFromConfig';
import { MarkerData } from '../../src/models/MarkerData';
import { CropSide, CropType, UnitType } from '../../src/ui-components/enums';
import { SmartCropUtil } from '../../src/util/SmartCropUtil';

/**
 *
 */
 it("testing SmartCrop calculating area method", done => {
    let mediaWidth = 1000, mediaHeight = 1000;
    let cropSideValues = new Map<CropSide, number>();
    cropSideValues.set(CropSide.TOP, 50);
    cropSideValues.set(CropSide.BOTTOM, 50);
    cropSideValues.set(CropSide.LEFT, 50);
    cropSideValues.set(CropSide.RIGHT, 50);
    let cropfromConfig = new CropFromConfig(true, cropSideValues, CropSide.RIGHT);

    let markerDataList = new Array<MarkerData>();
    markerDataList.push(new MarkerData(0.23, 0.15, 0.3, 0.3, UnitType.PERCENTAGE));

    let smartCropCalculator = new SmartCropUtil(CropType.FROM, cropfromConfig, mediaWidth, mediaHeight, markerDataList);
    let result = smartCropCalculator.calculateCropArea();
    //expect(result);
    done();
  });