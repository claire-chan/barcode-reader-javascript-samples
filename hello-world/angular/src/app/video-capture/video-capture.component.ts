import { Component, ElementRef, ViewChild } from '@angular/core';
import { EnumCapturedResultItemType } from '@dynamsoft/dynamsoft-core'
import { DecodedBarcodesResult } from '@dynamsoft/dynamsoft-barcode-reader';
import {
  CameraEnhancer,
  CameraView,
} from '@dynamsoft/dynamsoft-camera-enhancer';
import {
  CapturedResultReceiver,
  CaptureVisionRouter,
} from '@dynamsoft/dynamsoft-capture-vision-router';
import { MultiFrameResultCrossFilter } from '@dynamsoft/dynamsoft-utility';

@Component({
  selector: 'app-video-capture',
  templateUrl: './video-capture.component.html',
  styleUrls: ['./video-capture.component.css'],
})
export class VideoCaptureComponent {
  pInit: Promise<{
    cameraView: CameraView;
    cameraEnhancer: CameraEnhancer;
    router: CaptureVisionRouter;
  }> | null = null;

  @ViewChild('uiContainer') uiContainer: ElementRef<HTMLDivElement> | null =
    null;

  async init(): Promise<{
    cameraView: CameraView;
    cameraEnhancer: CameraEnhancer;
    router: CaptureVisionRouter;
  }> {
    try {
      // Create a `CameraEnhancer` instance for camera control.
      const cameraView = await CameraView.createInstance();
      const cameraEnhancer = await CameraEnhancer.createInstance(cameraView);
      this.uiContainer!.nativeElement.append(cameraView.getUIElement());
      
      // Create a `CaptureVisionRouter` instance and set `CameraEnhancer` instance as its image source.
      const router = await CaptureVisionRouter.createInstance();
      router.setInput(cameraEnhancer);
      
      // Define a callback for results.
      const resultReceiver = new CapturedResultReceiver();
      resultReceiver.onDecodedBarcodesReceived = (result: DecodedBarcodesResult) => {
        for (let item of result.barcodesResultItems) {
          console.log(item.text);
          alert(item.text);
        }
      };
      router.addResultReceiver(resultReceiver);

      // Filter out unchecked and duplicate results.
      const filter = new MultiFrameResultCrossFilter();
      filter.enableResultCrossVerification(
        EnumCapturedResultItemType.CRIT_BARCODE,
        true
      ); // Filter out unchecked barcodes.
      // Filter out duplicate barcodes within 3 seconds.
      filter.enableResultDeduplication(
        EnumCapturedResultItemType.CRIT_BARCODE,
        true
      );
      filter.setDuplicateForgetTime(
        EnumCapturedResultItemType.CRIT_BARCODE,
        3000
      );
      await router.addResultFilter(filter);

      // Open camera and start scanning.
      await cameraEnhancer.open();
      await router.startCapturing('ReadSingleBarcode');
      return {
        cameraView,
        cameraEnhancer,
        router,
      };
    } catch (ex: any) {
      let errMsg;
      if (ex.message.includes('network connection error')) {
        errMsg =
          'Failed to connect to Dynamsoft License Server: network connection error. Check your Internet connection or contact Dynamsoft Support (support@dynamsoft.com) to acquire an offline license.';
      } else {
        errMsg = ex.message || ex;
      }
      console.error(errMsg);
      alert(errMsg);
      throw ex;
    }
  }

  async ngOnInit(): Promise<void> {
    this.pInit = this.init();
  }

  async ngOnDestroy() {
    if (this.pInit) {
      const { cameraView, cameraEnhancer, router } = await this.pInit;
      router.dispose();
      cameraEnhancer.dispose();
      cameraView.dispose();
    }
    this.uiContainer!.nativeElement.innerText = "";
    console.log('VideoCaptureComponent Unmount');
  }
}
