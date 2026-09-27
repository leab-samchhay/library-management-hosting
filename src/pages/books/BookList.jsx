import React, { useContext } from 'react'
import { useState,useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { MdDelete, MdEditDocument } from "react-icons/md";
import { 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight 
} from 'lucide-react';
import api from '@/service/api';
import { GlobleContext } from '@/globleContext/GlobleContext';

const BookList = () => {
    const {isDarkMode} = useContext(GlobleContext)
    const [bookData, setBookData] = useState([]);
    const [Loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);

    const [perPage, setPerPage] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        from: 0,
        to: 0,
        total: 0
    });

    const getCategories = async () => {
        try {
            const res = await api.get('category');
            setCategories(res.data.data.data || res.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    useEffect(() =>{

        const delay = setTimeout (() =>{
            getData(1, perPage, search, categoryFilter)
        },500);
        return () => clearTimeout(delay);
        
    },[perPage, search, categoryFilter]);

    const getData = async(page = pagination.currentPage, limit = perPage, searchTem = search, catFilter = categoryFilter) =>{
        try{
            setLoading(true)
            const res = await api.get(`book?page=${page}&per_page=${limit}&search=${searchTem}&category_id=${catFilter}`)
            const result = res.data.data;
            setBookData(result.data || []);
            setPagination({
                currentPage: result.current_page,
                lastPage: result.last_page,
                from: result.from,
                to: result.to,
                total: result.total
            });
        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    };

    const handleDelete = async(id) =>{
        const confirm = window.confirm("Do you want to delete this record !!");
        if(confirm){
            try{
                setLoading(true);
                await api.delete(`book/${id}`);
                getData();
            }
            catch(error){
                console.log(error);
            }
            finally{
                setLoading(false);
            }
        }
    }

    return (
        <div>
            <div>
                <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 bg-blend-darken p-4 mb-3 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                    <div className={`text-2xl text-white text-center sm:text-left w-full sm:w-auto ${isDarkMode ? " text-white/60" : "text-white"}`}>
                        Manage Books
                    </div>

                    <div className='flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-5 items-center w-full sm:w-auto'>
                        <div className='relative'>
                            <div className="relative w-full">
                                <input 
                                    type="text"
                                    value={search}
                                    onChange={(e)=>setSearch(e.target.value)} 
                                    placeholder="search title ..." 
                                    className={`peer w-full rounded-sm border-2 ${isDarkMode ? "bg-black/30 text-white" : "bg-white"} py-1 pl-2 pr-10 text-black/70 outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-400`}
                                />
                                <div className={`pointer-events-none absolute inset-y-0 right-2 flex items-center text-lg ${isDarkMode ? " text-white/60 font-bold" : "text-black/30"} peer-focus:text-blue-500`}>
                                    <IoSearchOutline />
                                </div>
                            </div>
                        </div>
                        <div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className={`${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} px-4 md:px-2 py-1.5 md:py-1 rounded-xs cursor-pointer border-2`}
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.category_name || cat.name || cat.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div >
                            <select name="" id=""
                                value={perPage} 
                                onChange={(e)=>{
                                    const newPage = Number(e.target.value);
                                    setPerPage(newPage);
                                }}
                                className={`${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} px-4 md:px-2 py-1.5 md:py-1 rounded-xs cursor-pointer border-2`}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="30">30</option>
                                <option value="40">40</option>
                                <option value="50">50</option>
                                <option value="60">60</option>
                                <option value="70">70</option>
                                <option value="80">80</option>
                                <option value="90">90</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <button 
                            onClick={()=>navigate('/books/create')}
                            className={`flex items-center gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-10 md:px-2 py-1.5 md:py-1 transition-all`}
                        >
                            <span className='text-xl font-bold'><IoMdAddCircleOutline /></span>
                            <span>Add New</span>
                        </button>
                    </div>
                </div>
                
                <div className="relative">
                    <Table className={`${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} ${Loading ? "opacity-60 pointer-events-none" : "opacity-100"} transition-opacity duration-300`}>

                        <TableHeader  className="text-lg text-white border-2 border-blue-500/80 ">
                            <TableRow className={`${isDarkMode ? "bg-pink-500/20" : "bg-blue-500/80 hover:bg-blue-500/80 text-white"}`}>
                                <TableHead className={`${isDarkMode ? "text-white/70" : "text-white"} w-[80px]`}>No</TableHead>
                                <TableHead className={`${isDarkMode ? "text-white/70" : "text-white"}`}>Image</TableHead>
                                <TableHead className={`${isDarkMode ? "text-white/70" : "text-white"}`}>Title</TableHead>
                                <TableHead className={`${isDarkMode ? "text-white/70" : "text-white"}`}>ISBN</TableHead>
                                <TableHead className={`${isDarkMode ? "text-white/70" : "text-white"}`}>Category</TableHead>
                                <TableHead className={`${isDarkMode ? "text-white/70" : "text-white"}`}>Year</TableHead>
                                <TableHead className={`${isDarkMode ? "text-white/70" : "text-white"}`}>Qty</TableHead>
                                <TableHead className={`${isDarkMode ? "text-white/70" : "text-white"}`}>Status</TableHead>
                                <TableHead className={`${isDarkMode ? "text-white/70" : "text-white"} text-center w-30`}>Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className='text-[16px] border-2'>
                            {bookData.map((item,index) => (
                                <TableRow key={index} className="border-1">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        {item.image && item.image !== "null" ? (
                                            <img 
                                                src={item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000/storage/${item.image}`} 
                                                alt={item.title || "book"} 
                                                className="h-12 w-12 object-cover rounded bg-gray-100 border" 
                                                onError={(e) => { 
                                                    e.target.onerror = null; 
                                                    e.target.src = "https://placehold.co/100x100?text=No+Img"; 
                                                }} 
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-500 border border-gray-300">No Img</div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>{item.isbn}</TableCell>
                                    <TableCell>{item.category?.category_name}</TableCell>
                                    <TableCell>{item.publication_year}</TableCell>
                                    <TableCell>{item.qty}</TableCell>
                                    <TableCell>
                                        {String(item.status) === "1" ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Active
                                            </span>
                                            ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/50">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                                                Inactive
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className=" flex justify-center ">
                                        <div className="flex items-center gap-1 justify-center ">
                                            <button
                                                onClick={()=>navigate(`/books/edite/${item.id}`)}
                                                type="button"
                                                aria-label="Edit"
                                                className="group cursor-pointer flex h-8 w-8 items-center justify-center rounded-sm border border-transparent text-emerald-500 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 active:scale-95 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10"
                                            >
                                                <MdEditDocument className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                                            </button>

                                            <button
                                                onClick={()=>handleDelete(item.id)}
                                                type="button"
                                                aria-label="Delete"
                                                className="group cursor-pointer flex h-8 w-8 items-center justify-center rounded-sm border border-transparent text-rose-500 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 active:scale-95 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10"
                                            >
                                                <MdDelete className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                                            </button>
                                            </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    
                    {Loading && (
                        <div className="absolute inset-0 flex justify-center items-center bg-black/5 dark:bg-white/5 z-10 mt-30">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        </div>
                    )}
                </div>

                <div className='flex justify-end'>
                    <div className={` ${isDarkMode ? " bg-white/5 border-slate-200/20" : " bg-white border-slate-200"} flex items-center mt-2  gap-1.5 p-1  border  rounded-sm shadow-xs select-none w-fit`}>
                    
                        <button
                            type="button"
                            title="First page"
                            disabled={Loading || pagination.currentPage <= 1}
                            onClick={() => getData(1)}
                            className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            title="Previous page"
                            disabled={Loading || pagination.currentPage <= 1}
                            onClick={() => getData(pagination.currentPage - 1)}
                            className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className={` ${isDarkMode ? "bg-indigo-50/2 border border-indigo-100/3 text-white/70 font-semibold " : " bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold "} flex items-center px-3 h-8 rounded-lg  text-xs tracking-wide`}>
                            {pagination.currentPage} / {pagination.lastPage}
                        </div>

                        <button
                            type="button"
                            title="Next page"
                            disabled={Loading || pagination.currentPage >= pagination.lastPage}
                            onClick={() => getData(pagination.currentPage + 1)}
                            className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                            type="button"
                            title="Last page"
                            disabled={Loading || pagination.currentPage >= pagination.lastPage}
                            onClick={() => getData(pagination.lastPage)}
                            className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookList