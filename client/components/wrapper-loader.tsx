"use client"
import { motion } from "framer-motion";
import React, { useState } from 'react'

const WrapperLoader = ({ children } : {children: React.ReactNode}) => {

    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        document.title = "Ummah Connect";
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => {
            clearTimeout(timeout);
            document.title = "Ummah Connect";
        };
    }, []);


    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background pointer-events-none">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-2xl md:text-4xl font-semibold text-primary"
                >
                    Ummah Connect
                </motion.h1>
            </div>
        )
    }

    return children
}

export default WrapperLoader