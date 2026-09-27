import api from '@/service/api';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from '@base-ui/react/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from "@/components/ui/toast";
import { GlobleContext } from '@/globleContext/GlobleContext';
import { TiArrowBackOutline } from "react-icons/ti";
import { MdOutlineSaveAlt } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";

const AuthorBookForm = () => {
    const {isDarkMode} = useContext(GlobleContext);
    const [loading, setLoading] = useState(false);
    const [authors, setAuthors] = useState([]);
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    const {id} = useParams();
    const isEditeMode = Boolean(id);

    const [form, setForm] = useState({
        authors_id: [],
        book_id: ""
    });

    const getAuthorsAndBooks = async () => {
        try {
            const authorRes = await api.get('authors?per_page=1000');
            const bookRes = await api.get('book?per_page=1000');
            setAuthors(authorRes.data?.data?.data || []);
            setBooks(bookRes.data?.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch authors or books", error);
        }
    };

    const getData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`author-books/${id}`);
            const data = res.data.data;
            setForm({
                authors_id: data.authors_id ? data.authors_id.map(id => String(id)) : [],
                book_id: data.book_id || ""
            });
        } catch(error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAuthorsAndBooks();
        if(isEditeMode){
            getData();
        }
    }, [id, isEditeMode]);

    const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAuthorDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleReset = () => {
        setForm({
            authors_id: [],
            book_id: "",
        });
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.authors_id.length === 0) {
            alert("Please select at least one author.");
            return;
        }
        try {
            setLoading(true);
            let res;
            if(isEditeMode){
                res = await api.put(`author-books/${id}`, form);
            } else {
                res = await api.post('author-books', form);
            }

            if (toast && toast.add) {
                toast.add({
                    type: "success",
                    description: res.data?.message || "Record has been saved.",
                    timeout: 3000,
                });
            }

            setForm({
                authors_id: [],
                book_id: ""
            });

            navigate('/authorBooks');
        } catch (error) {
            console.error("Failed to create record:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className={`flex justify-between items-center bg-blend-darken p-4 mb-5 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
                    {isEditeMode ? "Update Author Book" : "Create Author Book"}
                </div>
                <button 
                    onClick={()=>navigate('/authorBooks')}
                    className={`flex items-center duration-300 gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-2 py-1`}
                >
                    <span className='text-xl font-bold'><TiArrowBackOutline /></span>
                    <span>Back</span>
                </button>
            </div>
            
            <div className={` ${isDarkMode ? " bg-white/2 text-white/50 " : " bg-white "} rounded-sm mx-auto mt-10 p-6  shadow-sm border-2`}>
                <form onSubmit={handleSubmit}>
                    <Field>
                        <FieldLabel>Authors</FieldLabel>
                        <div className="relative w-full mb-4" ref={dropdownRef}>
                            <div 
                                className={`w-full rounded-sm border-2 px-3 h-11 cursor-pointer outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-400 ${isDarkMode ? 'bg-black/30 text-white border-gray-600' : 'bg-white border-gray-300 text-black'} flex items-center justify-between`}
                                onClick={() => setIsAuthorDropdownOpen(!isAuthorDropdownOpen)}
                            >
                                <span className="truncate">
                                    {form.authors_id.length > 0 
                                        ? authors.filter(a => form.authors_id.includes(String(a.id))).map(a => a.authors_name).join(', ') 
                                        : "Select Authors"}
                                </span>
                                <span className="pointer-events-none opacity-50 text-xs">▼</span>
                            </div>

                            {isAuthorDropdownOpen && (
                                <div className={`absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md shadow-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'}`}>
                                    {authors.map(author => (
                                        <div 
                                            key={author.id} 
                                            className={`px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-blue-500 hover:text-white ${form.authors_id.includes(String(author.id)) ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : ''}`}
                                            onClick={() => {
                                                const idStr = String(author.id);
                                                if(form.authors_id.includes(idStr)) {
                                                    setForm(prev => ({ ...prev, authors_id: prev.authors_id.filter(id => id !== idStr) }));
                                                } else {
                                                    setForm(prev => ({ ...prev, authors_id: [...prev.authors_id, idStr] }));
                                                }
                                            }}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={form.authors_id.includes(String(author.id))} 
                                                readOnly
                                                className="cursor-pointer pointer-events-none"
                                            />
                                            {author.authors_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <FieldLabel htmlFor="book_id">Book</FieldLabel>
                        <select
                            id="book_id"
                            name="book_id"
                            value={form.book_id}
                            onChange={handleInput}
                            disabled={isEditeMode}
                            className={`w-full rounded-sm border-2 mb-4 px-3 h-11 outline-none transition-all duration-300 focus:ring-2 focus:ring-blue-400 ${isDarkMode ? 'bg-black/30 text-white border-gray-600' : 'bg-white border-gray-300 text-black'} ${isEditeMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                            required
                        >
                            <option value="">Select a Book</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id}>{book.title}</option>
                            ))}
                        </select>
                    </Field>

                    <div className='flex gap-2'>
                        <Button 
                            type="submit" 
                            disabled={loading} 
                            className={`${isDarkMode ? " bg-blue-500/40 text-white/60 " : " bg-blue-500/80 text-white "}  hover:bg-blue-700 duration-300 px-4 py-2 rounded-sm flex justify-center items-center gap-2 mt-5  cursor-pointer font-medium disabled:opacity-50`}
                        >
                            <span className='text-xl'>{isEditeMode ? <BiSolidEdit /> : <MdOutlineSaveAlt />}</span>
                            {isEditeMode ? "Update" : "Create"} {loading && <Spinner />}
                        </Button>

                        <Button
                            onClick={handleReset}
                            type="reset" 
                            className= {` ${isDarkMode ? "text-white/60" : "text-black"} border-2 hover:bg-gray-100 duration-300 px-4 py-2 rounded-sm flex justify-center items-center gap-2 mt-5 cursor-pointer font-medium disabled:opacity-50`}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthorBookForm;
