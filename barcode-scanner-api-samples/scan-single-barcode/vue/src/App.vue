<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { BarcodeScanner } from 'dynamsoft-barcode-reader-bundle';
import vueLogo from "./assets/vue.svg";

const scannerViewRef = ref(null);

onMounted(() => {
  // Configuration object for initializing the BarcodeScanner instance
  const config = {
    license: "DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9", // Replace with your Dynamsoft license key
    container: scannerViewRef.value!, // Specify where to render the scanner UI

    // Specify the path for the definition file "barcode-scanner.ui.xml" for the scanner view.
    uiPath: "https://cdn.jsdelivr.net/npm/dynamsoft-barcode-reader-bundle@11.0.3000/dist/",

    // showUploadImageButton: true,
    // showPoweredByDynamsoft: false,
    // scannerViewConfig: {
    //   showFlashButton: true,
    //   cameraSwitchControl: "toggleFrontBack",
    // },

    // Specify custom paths for the engine resources
    engineResourcePaths: {
      rootDirectory: "https://cdn.jsdelivr.net/npm/",
    },
  }
  
  // Create an instance of the BarcodeScanner with the provided configuration
  const barcodeScanner = new BarcodeScanner(config);

  // Launch the scanner; once a barcode is detected, display its text in an alert
  barcodeScanner.launch().then((result) => {
    if(result.barcodeResults.length) {
      alert(result.barcodeResults[0].text);
    }
  });
})
</script>

<template>
  <div class="barcode-scanner-hello-world-page">
    <div class="barcode-scanner-title">
      <h2 class="barcode-scanner-title-text">Hello World for Vue</h2>
      <img class="barcode-scanner-title-logo" :src="vueLogo" alt="logo"></img>
    </div>
    <!-- This div will host the barcode scanner's camera view -->
    <div class="barcode-scanner-view" ref="scannerViewRef"></div>
  </div>
</template>

<style scoped>
.barcode-scanner-hello-world-page {
  width: 100%;
  height: 100%;
  text-align: center;
}

.barcode-scanner-title {
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.barcode-scanner-title .barcode-scanner-title-logo {
  width: 30px;
  height: 30px;
  margin-left: 10px;
}

.barcode-scanner-view {
  width: 100%;
  height: calc(100% - 90px);
}
</style>
