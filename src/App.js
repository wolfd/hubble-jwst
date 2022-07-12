import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

import hubble from "./images/comparison-99-hubble.webp";
import jwst from "./images/comparison-99-jwst.webp";

function App() {
  return (
    <div className="App">
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={hubble}
            alt="Hubble"
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={jwst}
            alt="JWST"
          />
        }
        onlyHandleDraggable
      />
    </div>
  );
}

export default App;
