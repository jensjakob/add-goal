import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import mixpanel from "mixpanel-browser";

import MyContext from "./context/MyContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <MyContext>
      <App />
    </MyContext>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

mixpanel.init("424af2fd1c1c4e8504092eac6eab65b0", {
  // api_host: "https://api-eu.mixpanel.com",
  property_blacklist: [
    "$browser",
    "$browser_version",
    "$initial_referrer",
    "$initial_referring_domain",
    "$lib_version",
    "$os",
    "$screen_height",
    "$screen_width",
    "mp_lib",
  ],
  ip: false,
  debug: true,
});

mixpanel.track("init", {
  breakpoint:
    window.innerWidth < 640
      ? "small"
      : window.innerWidth > 1008
      ? "large"
      : "medium",
  pointer: window.matchMedia("(pointer: fine)").matches
    ? "fine"
    : window.matchMedia("(pointer: coarse)").matches
    ? "coarse"
    : "none",
});

function trackEvent(metric: any) {
  // const body = JSON.stringify(metric);
  // console.log(body);

  if (metric.name === "TTFB") {
    const value = Math.round(metric.value);
    mixpanel.track("ttfb", { value: value });
    console.log("sent ttfb", value, metric.value);
  }
}

reportWebVitals(trackEvent);
