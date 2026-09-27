import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { GlobleContext } from '@/globleContext/GlobleContext';
import api from '@/service/api';
import { Toaster } from '@/components/ui/toast';
import { TiArrowBackOutline } from "react-icons/ti";
import { Link } from 'react-router-dom';

import { 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight,
  Loader2
} from 'lucide-react';
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { AiOutlineBarcode } from "react-icons/ai";

const PageLoansAndReturn = () => {
    const { token } = useSelector(state => state.auth);
    const { isDarkMode,handleAddLoan } = useContext(GlobleContext);
    const [bookcopyData, setBookcopyData] = useState([]);
    const [category, setCategory] = useState([]);
    const [selectCategory, setSelectCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [unpaidFinesCount, setUnpaidFinesCount] = useState(0);
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(18);
    const navigate = useNavigate();
    const [loanBarcode, setLoanBarcode] = useState("");
    const [pagination, setPagination] = useState({
        currenPage: 1,
        lastPage: 1,
        from: 0,
        to: 0,
        total: 0
    });
    const buttons = [
        { name: "Loans Books", path: "/loansReturn/loansBook" },
        { name: "Return Books", path: "/loansReturn/returnBook" },
        { name: "Payment Fines", path: "/loansReturn/paymentLate" },
    ];

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const getDataBook = async (page = 1, limit = perPage, searchTerm = search, catId = selectCategory) => {
        try {
            setLoading(true);
            const categoryParam = catId && catId !== "all" ? `&category_id=${catId}` : "";
            const res = await api.get(`book-copies?page=${page}&per_page=${limit}&limit=${limit}&search=${searchTerm}${categoryParam}`);
            const result = res.data.data;
            
            setBookcopyData(result.data || []);
            setPagination({
                currenPage: result.current_page || 1,
                lastPage: result.last_page || 1,
                from: result.from || 0,
                to: result.to || 0,
                total: result.total || 0
            });
        } catch (error) {
            console.error("Failed to load book copies:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDataCategory = async () => {
        try {
            setLoading(true);
            const res = await api.get("category");
            setCategory(res.data.data.data || res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDataCategory();
    }, []);

    useEffect(()=>{
        getUnpaidFinesCount();
    })

    const getUnpaidFinesCount = async () => {
        try {
            const res = await api.get('fines?status=Unpaid&per_page=999999');
            const total = res.data.data.total || 0;
            setUnpaidFinesCount(total);
        } catch (error) {
            console.error("Failed to load unpaid fines count:", error);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            getDataBook(1, perPage, search, selectCategory);
        }, 500);
        return () => clearTimeout(delay);
    }, [perPage, search, selectCategory]);

    useEffect(() => {
        const handleSuccess = () => {
            getDataBook(pagination.currenPage, perPage, search, selectCategory);
        };
        window.addEventListener("loanSubmitSuccess", handleSuccess);
        return () => window.removeEventListener("loanSubmitSuccess", handleSuccess);
    }, [pagination.currenPage, perPage, search, selectCategory]);

    const handleBarcodeAddLoan = async () => {
        if (!loanBarcode.trim()) {
            alert("សូមបញ្ចូល Barcode សិន!");
            return;
        }

        try {
            setLoading(true);
            const res = await api.get(`book-copies?search=${loanBarcode}&per_page=1`);
            const result = res.data?.data?.data || res.data?.data || [];
            
            if (result.length > 0) {
                const bookCopy = result[0];
                if (bookCopy.barcode === loanBarcode) {
                    if (bookCopy.status === "Borrowed" || bookCopy.status == 2) {
                        alert("សៀវភៅនេះកំពុងត្រូវបានគេខ្ចី!");
                    } else if (bookCopy.status === "Inactive" || bookCopy.status == 0) {
                        alert("សៀវភៅនេះមិនអាចខ្ចីបានទេ (Inactive)!");
                    } else {
                        handleAddLoan(bookCopy);
                        setLoanBarcode("");
                        navigate('/loansReturn/loansBook')
                    }
                } else {
                    alert("រកមិនឃើញសៀវភៅដែលមាន Barcode នេះទេ!");
                }
            } else {
                alert("រកមិនឃើញសៀវភៅដែលមាន Barcode នេះទេ!");
            }
        } catch (error) {
            console.error("Error searching barcode:", error);
            alert("មានបញ្ហាក្នុងការស្វែងរក Barcode!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 75 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="w-full h-full pb-2 flex flex-col lg:flex-row items-start gap-0"
        >
            <div className="w-full px-4 py-2 flex-1">
                {loading ? (
                    <div className="h-96 flex items-center justify-center w-full">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div>
                        <div className={`sticky top-0 z-50 flex flex-col md:flex-row gap-2 items-center bg-blend-darken p-4 mb-3 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500 md:bg-blue-500/80"} rounded-sm`}>
                            <div className='w-full md:w-min'>
                                <div className='bg-red-50 justify-start rounded-2xl'>
                                    <button 
                                        onClick={() => navigate('/')}
                                        className={`flex rounded-xs items-center duration-300 gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-2 py-1`}
                                    >
                                        <span className='text-xl font-bold'><TiArrowBackOutline /></span>
                                        <span>Back</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className='flex gap-2 items-center w-full sm:w-auto'>
                                <div className='relative'>
                                    <div className="relative w-full">
                                        <input 
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)} 
                                            placeholder="search barcode ..." 
                                            className={`peer w-full rounded-sm border-2 ${isDarkMode ? "bg-black/30 text-white" : "bg-white"} py-1 pl-2 pr-10 text-black/70 outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-400`}
                                        />
                                        <div className={`pointer-events-none absolute inset-y-0 right-2 flex items-center text-lg ${isDarkMode ? "text-white/60 font-bold" : "text-black/30"} peer-focus:text-blue-500`}>
                                            <IoSearchOutline />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <select
                                        value={selectCategory}
                                        onChange={(e) => setSelectCategory(e.target.value)} 
                                        className={`flex items-center ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-1 md:px-2 py-1 md:py-1.5 transition-all outline-none`}
                                    >
                                        <option value="">All Category</option>
                                        {category.map((cat) => ( 
                                            <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='flex gap-2 items-center w-full sm:w-auto'>
                                <div className='relative'>
                                    <div className="relative w-full">
                                        <input 
                                            type="text"
                                            value={loanBarcode}
                                            onChange={(e) => setLoanBarcode(e.target.value)} 
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleBarcodeAddLoan();
                                            }}
                                            placeholder="input barcode to loan ..." 
                                            className={`peer w-full rounded-sm border-2 ${isDarkMode ? "bg-black/30 text-white" : "bg-white"} py-1 pl-2 pr-10 text-black/70 outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-400`}
                                        />
                                        <div className={`pointer-events-none absolute inset-y-0 right-2 flex items-center text-lg ${isDarkMode ? "text-white/60 font-bold" : "text-black/30"} peer-focus:text-blue-500`}>
                                            <AiOutlineBarcode />
                                        </div>
                                    </div>
                                </div>
                               
                                <button 
                                    onClick={handleBarcodeAddLoan}
                                    className={`flex items-center gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-3 md:px-2 py-1.5 md:py-1 transition-all`}
                                >
                                    <span className='text-xl font-bold'><IoMdAddCircleOutline /></span>
                                    <span>AddLoan</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-0 md:gap-2 w-full">
                            {bookcopyData.filter(item => item.status !== "Inactive" && item.status != 0).map((item) => {
                                const imageUrl = item.book?.image;
                                return (
                                    <div key={item.id} className="flex flex-col items-center group cursor-pointer">
                                        {/* Image & Hover Overlay Container */}
                                        <div className="relative w-full h-40 flex items-center justify-center overflow-hidden rounded-sm">
                                            {imageUrl && imageUrl !== "null" ? (
                                                <img 
                                                    src={imageUrl.startsWith('http') ? imageUrl : `http://127.0.0.1:8000/storage/${imageUrl}`} 
                                                    alt={item.book?.title || "book"} 
                                                    className="h-full w-full object-contain" 
                                                    onError={(e) => { 
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://placehold.co/100x100?text=No+Img"; 
                                                    }} 
                                                />
                                            ) : (
                                                <div className="h-28 w-28 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-500 border border-gray-300">
                                                    No Img
                                                </div>
                                            )}

                                            {/* Centered Blur Overlay + Button */}

                                            {item.status === "Borrowed" || item.status == 2 ? (
                                                <div className="absolute inset-0 bg-blue-500/70 text-xl font-medium text-white  flex items-center justify-center p-3 transition-all duration-300">   
                                                    Borrowed...
                                                </div>
                                            ):(
                                                <div className="absolute inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                                    
                                                    <Link to='/loansReturn/loansBook'>
                                                        <button
                                                            onClick={()=>handleAddLoan(item)} 
                                                            
                                                            className="w-full cursor-pointer py-1.5 px-3 rounded-xs bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                                        >
                                                            Add Loan
                                                        </button>
                                                    </Link>
                                                </div>
                                            ) }
                                            
                                        </div>

                                        {/* Title below */}
                                        <h4 className="text-center text-sm font-medium mt-1.5 line-clamp-2">
                                            {item.book?.title || "Untitled"}
                                        </h4>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="flex justify-center mt-2 w-full">
                    <div className={`${isDarkMode ? "bg-white/5 border-slate-200/20" : "bg-white border-slate-200"} flex items-center gap-1.5 p-1 border rounded-sm shadow-xs select-none w-fit`}>
                        <button
                            type="button"
                            title="First page"
                            disabled={loading || pagination.currenPage <= 1}
                            onClick={() => getDataBook(1, perPage, search, selectCategory)}
                            className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            title="Previous page"
                            disabled={loading || pagination.currenPage <= 1}
                            onClick={() => getDataBook(pagination.currenPage - 1, perPage, search, selectCategory)}
                            className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className={`${isDarkMode ? "bg-indigo-50/2 border border-indigo-100/3 text-white/70 font-semibold" : "bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold"} flex items-center px-3 h-8 rounded-lg text-xs tracking-wide`}>
                            {pagination.currenPage} / {pagination.lastPage}
                        </div>

                        <button
                            type="button"
                            title="Next page"
                            disabled={loading || pagination.currenPage >= pagination.lastPage}
                            onClick={() => getDataBook(pagination.currenPage + 1, perPage, search, selectCategory)}
                            className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            title="Last page"
                            disabled={loading || pagination.currenPage >= pagination.lastPage}
                            onClick={() => getDataBook(pagination.lastPage, perPage, search, selectCategory)}
                            className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-80 xl:w-150 shrink-0 h-auto min-h-[400px] mt-2 mr-2">
                <div className='sticky z-50 top-0 flex flex-col md:flex-row gap-4 justify-center items-center bg-blue-500 md:bg-blue-500/80 rounded-sm py-4 px-4'>
                    {buttons.map((btn) => (
                        <NavLink
                            key={btn.path}
                            to={btn.path}
                            className={({ isActive }) => `relative px-4 py-1 text-center cursor-pointer rounded-sm font-medium shadow-md transition-colors w-full border-2 ${
                                isActive
                                    ? "bg-red-400 text-white border-white"
                                    : "bg-white text-blue-500 hover:bg-slate-50 border-transparent"
                            }`}
                        >
                            {btn.name}
                            {btn.name === "Payment Fines" && unpaidFinesCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white">
                                    {unpaidFinesCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </div>

                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 75 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2 }}
                        className={`mt-3 overflow-hidden rounded-sm ${isDarkMode ? "bg-transparent" : "bg-white"}`}
                    >
                        <Outlet/>
                    </motion.div>
                    <Toaster />
                </div>
            </div>
        </motion.div>
    );
};

export default PageLoansAndReturn;