"use client";

import Basic from "@/src/Component/Basic";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import Sockette from "sockette";

// import PlayWithComputer from "@/src/Component/PlayWithComputer";
const PlayWithComputer = dynamic(
  () => import("@/src/Component/PlayWithComputer"),
  {
    ssr: false,
  }
);

let ws = null;

const HomePage = () => {
  // connect to websocket using aws api gateway
  useEffect(() => {
    ws = new Sockette(
      "wss://ahl0qo8y0f.execute-api.ap-southeast-1.amazonaws.com/development",
      {
        timeout: 5e3,
        maxAttempts: 1,
        onopen: (e) => console.log("Connected!", e),
        onerror(ev) {
          console.log("Error", ev);
        },
      }
    );
  }, []);

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="w-[560px]">
        {/* <PlayWithComputer /> */}
        <Basic />
      </div>
    </div>
  );
};

export default HomePage;
