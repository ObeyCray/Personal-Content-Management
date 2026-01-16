
import { Variants } from "framer-motion";

export const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            type: "spring",
            stiffness: 50,
            damping: 20
        }
    },
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const scaleUp: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    },
};

export const slideInLeft: Variants = {
    hidden: { x: -50, opacity: 0 },
    show: {
        x: 0,
        opacity: 1,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 500
        }
    },
};

export const slideInRight: Variants = {
    hidden: { x: 50, opacity: 0 },
    show: {
        x: 0,
        opacity: 1,
        transition: {
            type: "spring",
            damping: 25,
            stiffness: 500
        }
    },
};

export const hoverScale = {
    scale: 1.02,
    transition: { duration: 0.2 }
};

export const tapScale = {
    scale: 0.98,
    transition: { duration: 0.1 }
};
