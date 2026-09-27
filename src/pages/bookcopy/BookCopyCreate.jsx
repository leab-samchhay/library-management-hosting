import { GlobleContext } from '@/globleContext/GlobleContext'
import api from '@/service/api';
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from '@base-ui/react/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from "@/components/ui/toast";
import { TiArrowBackOutline } from "react-icons/ti";
import { MdOutlineSaveAlt } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const BookCopyCreate = () => {

    const {isDarkMode} = useContext(GlobleContext);
    const [Loading,setLoading] = useState(false);
    const {id} =useParams();
    const [bookData,setBookData] = useState([]);
    const navigate = useNavigate();
    const isEditeMode = Boolean(id);
    const [form,setForm] = useState({
        book_id: "",
        barcode: "",
        page_number: "",
        shelf_location: "",
        acquisition_date: "",
        price: "",
        condition: "",
        status: "",
    })

    const getDataBook = async()=>{
        try{
            setLoading(true);
            const res = await api.get('book');
            setBookData(res.data.data.data || []);
        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

    const getBookCopy = async() =>{
        try{
            setLoading(true);
            const res = await api.get(`book-copies/${id}`);
            const result = res.data.data
            setForm({
                book_id: result.book_id,
                barcode: result.barcode,
                page_number: result.page_number,
                shelf_location: result.shelf_location,
                acquisition_date: result.acquisition_date,
                price: result.price,
                condition: result.condition,
                status: result.status,
            })
        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

    const handleReset = () => {
        setForm({
            book_id: "",
            barcode: "",
            page_number: "",
            shelf_location: "",
            acquisition_date: "",
            price: "",
            condition: "",
            status: "",
        })
    }

    useEffect(()=>{
        if(isEditeMode){
            getBookCopy();
        }
        
        getDataBook();
        
    },[id,isEditeMode])

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            let res ;
            setLoading(true);

            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (form[key] !== null && form[key] !== undefined && form[key] !== "") {
                    formData.append(key, form[key]);
                }
            });

            if(isEditeMode){
                formData.append("_method", "PUT");
                res = await api.post(`book-copies/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }
            else{
                res = await api.post("book-copies", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            }

            if (toast && toast.add) {
                toast.add({
                    type: "success",
                    description: res.data?.message || "Book copy has been saved.",
                    timeout: 3000,
                });
            }

            handleReset();
            navigate('/bookcopy');

        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

    const handleInput = (e) =>{
        const {name,value,type,files} = e.target;
        if (type === "file") {
            setForm((pre) => ({...pre,[name]:files[0]}));
        } else {
            setForm((pre) => ({...pre,[name]:value}));
        }
    }

    return (
        <div>
            <div className={`flex justify-between items-center bg-blend-darken p-4 mb-5 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
                    {isEditeMode ? "Update BookCopy" : "Create BookCopy"}
                </div>
                <button 
                    onClick={()=>navigate('/bookcopy')}
                    className={`flex items-center duration-300 gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-2 py-1`}
                >
                    <span className='text-xl font-bold'><TiArrowBackOutline /></span>
                    <span>Back</span>
                </button>
            </div>
            
            <div className={` ${isDarkMode ? " bg-white/2 text-white/50 " : " bg-white "} rounded-sm mx-auto mt-10 p-6  shadow-sm border-2`}>
                <form onSubmit={handleSubmit}>
                    <Field className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <FieldLabel htmlFor="member_id">Book</FieldLabel>
                            <Select
                                value={form.book_id !== "" && form.book_id !== null && form.book_id !== undefined ? String(form.book_id) : ""}
                                onValueChange={(val) => {setForm((pre) => ({...pre,book_id: Number(val)}))}}
                            >
                                <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                                    <SelectValue placeholder="Select Book">
                                        {form.book_id ?
                                            bookData.find((e) => String(e.id) === String(form.book_id))?.title || "Unknown Book"
                                            : "Select Book"
                                        }
                                    </SelectValue>
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectGroup >
                                        {bookData.filter((item) => String(item.status) === '1').map((item) => (
                                            <SelectItem key={item.id} value={String(item.id)}>
                                                {item.id} - {item.title}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>

                            </Select>
                        </div>

                        <div>
                            <FieldLabel htmlFor="barcode">Barcode</FieldLabel>
                            <Input
                                id="barcode"
                                type="text"
                                name="barcode"
                                value={form.barcode}
                                onChange={handleInput}
                                placeholder="Input barcode"
                                className="rounded-sm mb-4 py-5"
                            />

                        </div>

                        <div>
                            <FieldLabel htmlFor="page_number">Page Number</FieldLabel>
                            <Input
                                id="page_number"
                                type="number"
                                name="page_number"
                                value={form.page_number}
                                onChange={handleInput}
                                placeholder="Input page number"
                                className="rounded-sm mb-4 py-5"
                            />
                        </div>

                        <div>
                            <FieldLabel htmlFor="shelf_location">Shelf Location</FieldLabel>
                            <Input
                                id="shelf_location"
                                type="text"
                                name="shelf_location"
                                value={form.shelf_location}
                                onChange={handleInput}
                                placeholder="Input shelf location"
                                className="rounded-sm mb-4 py-5"
                            />
                        </div>

                        <div>
                            <FieldLabel htmlFor="acquisition_date">Acquisition Date</FieldLabel>
                            <Input
                                id="acquisition_date"
                                type="date"
                                name="acquisition_date"
                                value={form.acquisition_date}
                                onChange={handleInput}
                                className="rounded-sm mb-4 py-5"
                            />
                        </div>

                        <div>
                            <FieldLabel htmlFor="price">Price</FieldLabel>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                name="price"
                                value={form.price}
                                onChange={handleInput}
                                placeholder="Input price"
                                className="rounded-sm mb-4 py-5"
                            />
                        </div>

                        <div>
                            <FieldLabel htmlFor="condition">Condition</FieldLabel>
                            <Input
                                id="condition"
                                type="text"
                                name="condition"
                                value={form.condition}
                                onChange={handleInput}
                                placeholder="e.g. New, Good, Fair"
                                className="rounded-sm mb-4 py-5"
                            />
                        </div>

                        <div>
                            <FieldLabel htmlFor="status">Status</FieldLabel>
                            <Select
                                value={form.status !== "" && form.status !== null && form.status !== undefined ? String(form.status) : ""}
                                onValueChange={(val) => {setForm((pre) => ({...pre,status: val}))}}
                            >
                                <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                                    <SelectValue placeholder="Select status">
                                        {form.status ? form.status : "Select status"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Borrowed">Borrowed</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                       
                    </Field>

                    <div className='flex gap-2'>
                        <Button 
                            type="submit" 
                            disabled={Loading} 
                            className={`${isDarkMode ? " bg-blue-500/40 text-white/60 " : " bg-blue-500/80 text-white "}  hover:bg-blue-700 duration-300 px-4 py-2 rounded-sm flex justify-center items-center gap-2 mt-5  cursor-pointer font-medium disabled:opacity-50`}
                        >
                            <span className='text-xl'>{isEditeMode ? <BiSolidEdit /> : <MdOutlineSaveAlt />}</span>
                            {isEditeMode ? "Update" : "Create"} {Loading && <Spinner />}
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
    )
}

export default BookCopyCreate