import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type RotatingTextProps = {
    texts: string[];
    interval?: number;
};

const RotatingText: React.FC<RotatingTextProps> = ({
    texts,
    interval = 2000,
}) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % texts.length);
        }, interval);
        return () => clearInterval(timer);
    }, [texts.length, interval]);

    return (
        <span
        style={{
            display: "inline-block",
            width: "150px",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            backgroundColor: "#a0d8ef",
            borderRadius:10,
            padding: 7,
            margin: 16
        }}
        >
            <AnimatePresence mode="wait">
            <motion.span
                key={texts[index]}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.5 }}
                >
                {texts[index]}
            </motion.span>
            </AnimatePresence>
        </span>
    );
};

export default RotatingText;
