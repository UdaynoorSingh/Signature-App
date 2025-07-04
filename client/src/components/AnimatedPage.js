import React from 'react';
import {motion} from 'framer-motion';

const pageVariants ={
    initial:{
        opacity: 0,
        y: 40,
        scale: 0.96,
        filter: 'blur(8px)'
    },
    in:{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)'
    },
    out:{
        opacity: 0,
        y: -40,
        scale: 1.04,
        filter: 'blur(8px)'
    },
};

const pageTransition ={
    type: 'spring',
    stiffness: 80,
    damping: 18,
    duration: 0.7,
};

const AnimatedPage = ({children})=>{
    return(
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{boxShadow: '0 8px 32px rgba(0,0,0,0.10)'}}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage; 