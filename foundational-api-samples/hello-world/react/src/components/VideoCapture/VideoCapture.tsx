import React from "react";
import "../../dynamsoft.config"; // import side effects. The license, engineResourcePath, so on.
import { CameraEnhancer, CameraView } from "dynamsoft-barcode-reader-bundle";
import { CaptureVisionRouter } from "dynamsoft-barcode-reader-bundle";
import { MultiFrameResultCrossFilter } from "dynamsoft-barcode-reader-bundle";
import "./VideoCapture.css";

const componentDestroyedErrorMsg = "VideoCapture Component Destroyed";

class VideoCapture extends React.Component {
  state = {
    resultText: "",
  };
  cameraViewContainer: React.RefObject<HTMLDivElement> = React.createRef();

  resolveInit?: () => void;
  pInit: Promise<void> = new Promise((r) => (this.resolveInit = r));
  isDestroyed = false;

  cvRouter?: CaptureVisionRouter;
  cameraEnhancer?: CameraEnhancer;

  async componentDidMount() {
    try {
      // Create a `CameraEnhancer` instance for camera control and a `CameraView` instance for UI control.
      const cameraView = await CameraView.createInstance();
      if (this.isDestroyed) {
        throw Error(componentDestroyedErrorMsg);
      } // Check if component is destroyed after every async

      this.cameraEnhancer = await CameraEnhancer.createInstance(cameraView);
      if (this.isDestroyed) {
        throw Error(componentDestroyedErrorMsg);
      }

      // Get default UI and append it to DOM.
      this.cameraViewContainer.current!.append(cameraView.getUIElement());

      // Create a `CaptureVisionRouter` instance and set `CameraEnhancer` instance as its image source.
      this.cvRouter = await CaptureVisionRouter.createInstance();
      if (this.isDestroyed) {
        throw Error(componentDestroyedErrorMsg);
      }
      this.cvRouter.setInput(this.cameraEnhancer);

      // Define a callback for results.
      this.cvRouter.addResultReceiver({
        onDecodedBarcodesReceived: (result) => {
          if (!result.barcodeResultItems.length) return;

          let _resultText = "";
          console.log(result);
          for (let item of result.barcodeResultItems) {
            _resultText += `${item.formatString}: ${item.text}\n\n`;
          }
          this.setState({ resultText: _resultText });
        },
      });

      // Filter out unchecked and duplicate results.
      const filter = new MultiFrameResultCrossFilter();
      // Filter out unchecked barcodes.
      filter.enableResultCrossVerification("barcode", true);
      // Filter out duplicate barcodes within 3 seconds.
      filter.enableResultDeduplication("barcode", true);
      await this.cvRouter.addResultFilter(filter);
      if (this.isDestroyed) {
        throw Error(componentDestroyedErrorMsg);
      }

      // Open camera and start scanning barcode.
      await this.cameraEnhancer.open();
      cameraView.setScanLaserVisible(true);
      if (this.isDestroyed) {
        throw Error(componentDestroyedErrorMsg);
      }
      await this.cvRouter.startCapturing("ReadBarcodes_SpeedFirst");
      if (this.isDestroyed) {
        throw Error(componentDestroyedErrorMsg);
      }
    } catch (ex: any) {
      if ((ex as Error)?.message === componentDestroyedErrorMsg) {
        console.log(componentDestroyedErrorMsg);
      } else {
        let errMsg = ex.message || ex;
        console.error(errMsg);
        alert(errMsg);
      }
    }

    // Resolve pInit promise once initialization is complete.
    this.resolveInit!();
  }

  async componentWillUnmount() {
    this.isDestroyed = true;
    try {
      // Wait for the pInit to complete before disposing resources.
      await this.pInit;
      this.cvRouter?.dispose();
      this.cameraEnhancer?.dispose();
    } catch (_) {}
  }

  render() {
    return (
      <div>
        <div ref={this.cameraViewContainer} style={{ width: "100%", height: "70vh" }}></div>
        <br />
        Results:
        <div className="results">{this.state.resultText}</div>
      </div>
    );
  }
}

export default VideoCapture;
