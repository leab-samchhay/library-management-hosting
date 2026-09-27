import { Barcode } from 'lucide-react';
import React, { createContext } from 'react'
import { useState,useEffect } from 'react';

export const GlobleContext = createContext()

const GlobalProvider = ({children}) => {

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('isDarkMode');
        return savedTheme !== null ? JSON.parse(savedTheme) : false;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const handleAddLoan = (item) => {
        const saveLoans = JSON.parse(localStorage.getItem('loanBooks') || '[]');
        const isExist = saveLoans.some((b) => b.barcode === item.barcode);
        if(isExist){
            alert('សៀវភៅនេះត្រូវបានបន្ថែមរួចរាល់ហើយ!');
            return;
        }

        const newBook = {
            id : item.id,
            barcode : item.barcode,
            title : item.book?.title || 'Untitled',
            image : item.book?.image,
            return_date: ''
        }

        const updateLoans = [...saveLoans, newBook];
        localStorage.setItem('loanBooks', JSON.stringify(updateLoans));

        window.dispatchEvent(new Event('loanBooksUpdated'));
    }


    const send = {
        isDarkMode,
        setIsDarkMode,
        handleAddLoan
    }
    return (
        <div>
            <GlobleContext.Provider value={send}>
                {children}
            </GlobleContext.Provider>
        </div>
    )
}

export default GlobalProvider