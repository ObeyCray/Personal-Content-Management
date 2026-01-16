
"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";

if (typeof window !== "undefined") {
    gsap.registerPlugin(useGSAP, CustomEase);

    // Custom Ease for that "Apple" feel
    CustomEase.create("premium", "0.23, 1, 0.32, 1");
}

export { gsap, useGSAP };
