import React from 'react';
import { motion } from 'framer-motion';

const transition = {
    duration: 0.9,
    ease: [0.77, 0, 0.175, 1],
};

const variants = {
    initial: {
        clipPath: 'circle(0% at 50% 50%)',
        opacity: 0.5,
    },
    animate: {
        clipPath: 'circle(150% at 50% 50%)',
        opacity: 1,
        transition,
    },
    exit: {
        clipPath: 'circle(0% at 50% 50%)',
        opacity: 0.5,
        transition,
    },
};

const CircularRevealPage = ({ children }) => (
    <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh', width: '100%', position: 'relative', background: 'white' }}
    >
        {children}
    </motion.div>
);

export default CircularRevealPage; 