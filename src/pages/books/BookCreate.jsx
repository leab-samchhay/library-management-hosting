import api from '@/service/api';
import React, { useContext, useEffect, useState } from 'react'
import { useParams,useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/toast"
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from '@base-ui/react/button';
import { Spinner } from '@/components/ui/spinner';
import { IoMdAddCircleOutline } from "react-icons/io";
import { TiArrowBackOutline } from "react-icons/ti";
import { MdOutlineSaveAlt } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi"
import { GlobleContext } from '@/globleContext/GlobleContext';
import { MdDelete, MdEditDocument } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const BookCreate = () => {
  const {isDarkMode} = useContext(GlobleContext);
  const [Loading,setLoading] = useState(false);
  const {id} = useParams();
  const navigate = useNavigate();
  const isEditeMode = Boolean(id);
  
  const [categoryData, setCategoryData] = useState([]);
  const [publishersData, setPublishersData] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [row,setRow] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]);
  const [form,setForm] = useState({
    title: "",
    category_id: "",
    publishers_id: "",
    isbn: "",
    image: null,
    description: "",
    publication_year: "",
    language: "",
    qty: "",
    status: ""
  });
  

  const getDependencies = async () => {
    try {
      const [catRes, pubRes] = await Promise.all([
        api.get('category'),
        api.get('publishers')
      ]);
      setCategoryData(catRes.data.data.data || catRes.data.data || []);
      setPublishersData(pubRes.data.data.data || pubRes.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getData = async() =>{
    try{
      setLoading(true);
      const res = await api.get(`book/${id}`)
      const result = res.data.data;
      setForm({
        title: result.title || '',
        category_id: result.category_id || '',
        publishers_id: result.publishers_id || '',
        isbn: result.isbn || '',
        image: null, 
        description: result.description || '',
        publication_year: result.publication_year || '',
        language: result.language || '',
        qty: result.qty || '',
        status: result.status !== undefined && result.status !== null ? result.status : ''
      });
      
      if (result.image && result.image !== "null") {
        setPreviewImage(result.image.startsWith('http') ? result.image : `http://127.0.0.1:8000/storage/${result.image}`);
      }

      if (result.copies && result.copies.length > 0) {
        const formattedCopies = result.copies.map(copy => ({
          id: copy.id,
          copy_id: copy.id, 
          barcode: copy.barcode || '',
          page_number: copy.page_number || '',
          shelf_location: copy.shelf_location || '',
          acquisition_date: copy.acquisition_date || '',
          price: copy.price || '',
          condition: copy.condition || '',
          status: copy.status !== null ? copy.status : ''
        }));
        setRow(formattedCopies);
      }
    }
    catch(error){
      console.log(error);
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    getDependencies();
    if(isEditeMode){
      getData();
    }
  },[id,isEditeMode])

  const handleReset = () =>{
    setForm({
      title: "",
      category_id: "",
      publishers_id: "",
      isbn: "",
      image: null,
      description: "",
      publication_year: "",
      language: "",
      qty: "",
      status: ""
    });
    setRow([]);
    setDeletedRows([]);
    setPreviewImage(null);
  }

  const handleInput = (e) =>{
    const {name, value, type, files} = e.target;
    if (type === "file") {
      const file = files[0];
      setForm((pre) => ({...pre, [name]: file}));
      if (file) {
        setPreviewImage(URL.createObjectURL(file));
      } else {
        setPreviewImage(null);
      }
    } else {
      setForm((pre) => ({...pre,[name]:value}));
    }
  }

  const handleSubmit = async(e) =>{
    e.preventDefault();
    try{
      setLoading(true);
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });

      // Filter out empty rows (must have at least a barcode)
      const validRows = row.filter(item => item.barcode && item.barcode.trim() !== "");

      // Append Book Copies
      validRows.forEach((item, index) => {
        if(item.copy_id) {
          formData.append(`book_copies[${index}][id]`, item.copy_id);
        }
        formData.append(`book_copies[${index}][barcode]`, item.barcode);
        formData.append(`book_copies[${index}][page_number]`, item.page_number || "");
        formData.append(`book_copies[${index}][shelf_location]`, item.shelf_location || "");
        formData.append(`book_copies[${index}][acquisition_date]`, item.acquisition_date || "");
        formData.append(`book_copies[${index}][price]`, item.price || "");
        formData.append(`book_copies[${index}][condition]`, item.condition || "");
        formData.append(`book_copies[${index}][status]`, item.status !== "" ? item.status : "");
      });

      // Append Deleted Copies
      deletedRows.forEach((deletedId, index) => {
        formData.append(`deleted_copies[${index}]`, deletedId);
      });

      let res;
      if(isEditeMode){
        formData.append("_method", "PUT");
        res = await api.post(`bookTransaction/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      else{
        res = await api.post('bookTransaction', formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
        
      if (toast && toast.add) {
        const ids = toast.add({
          description: res.data?.message || "Saved successfully" ,
          actionProps: {
            children: "Undo",
            onClick() {
              toast.close(ids)
            },
          },
        });
      }

      handleReset();
      navigate('/books')
    }
    catch(error){
      console.log(error);
      const errorMsg = error.response?.data?.message || "An error occurred";
      alert(errorMsg);
    }
    finally{
      setLoading(false);
    }
  }
  const items = [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ]

  const handleAddRow = () =>{
    setRow([
      ...row,
      {
        id: Date.now(),
        book_id: '', 
        barcode: '', 
        page_number: '', 
        shelf_location: '', 
        acquisition_date: '', 
        price: '', 
        condition: '', 
        status: ''
      }
    ])
  }

  const handleInputChange = (id,fileName,value) =>{
    const updateRows = row.map((r) => {
      if(r.id === id){
        return { ...r, [fileName]: value };
      }
      return r;
    });
    setRow(updateRows);
  }

  const handleDeleteRow = (id) =>{
    const rowToDelete = row.find((r) => r.id === id);
    if (rowToDelete && rowToDelete.copy_id) {
      setDeletedRows([...deletedRows, rowToDelete.copy_id]);
    }
    const updateRow = row.filter((r) =>r.id !== id);
    setRow(updateRow);
  }
    
  return (
    <div>
      <div className={`flex justify-between items-center bg-blend-darken p-4 mb-3 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
        <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
          {isEditeMode ? "Update Book" : "Create Book"}
        </div>
        <button 
          onClick={()=>navigate('/books')}
          className={`flex items-center duration-300 gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-2 py-1`}
        >
          <span className='text-xl font-bold'><TiArrowBackOutline /></span>
          <span>Back</span>
        </button>
      </div>

      <div className={` ${isDarkMode ? " bg-white/2 text-white/50 " : " bg-white "} rounded-sm mx-auto mt-5 p-6  shadow-sm border-2`}>
        <form onSubmit={handleSubmit}>
          <Field>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 items-center'>
              <div>
                <FieldLabel htmlFor="title">Book Title</FieldLabel>
                <Input
                  id="title"
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInput}
                  placeholder="Input book title"
                  className="rounded-sm mb-4 py-5"
                  required
                />
              </div>

              <div>
                <FieldLabel htmlFor="category_id">Category</FieldLabel>
                <Select 
                  value={form.category_id !== "" && form.category_id !== null && form.category_id !== undefined ? String(form.category_id) : ""}
                  onValueChange={(val) => {setForm((pre) => ({...pre,category_id: Number(val)}))}}
                >
                  <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                    <SelectValue placeholder="Select Category">
                      {form.category_id ?
                        categoryData.find((e) => String(e.id) === String(form.category_id))?.category_name || categoryData.find((e) => String(e.id) === String(form.category_id))?.name || "Unknown"
                        : "Select Category"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup >
                      {categoryData.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.category_name || item.name || item.id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel htmlFor="publishers_id">Publisher</FieldLabel>
                <Select 
                  value={form.publishers_id !== "" && form.publishers_id !== null && form.publishers_id !== undefined ? String(form.publishers_id) : ""}
                  onValueChange={(val) => {setForm((pre) => ({...pre,publishers_id: Number(val)}))}}
                >
                  <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                    <SelectValue placeholder="Select Publisher">
                      {form.publishers_id ?
                        publishersData.find((e) => String(e.id) === String(form.publishers_id))?.publishers_name || publishersData.find((e) => String(e.id) === String(form.publishers_id))?.name || "Unknown"
                        : "Select Publisher"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup >
                      {publishersData.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.publishers_name || item.name || item.id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel htmlFor="isbn">ISBN</FieldLabel>
                <Input
                  id="isbn"
                  type="text"
                  name="isbn"
                  value={form.isbn}
                  onChange={handleInput}
                  placeholder="Input ISBN"
                  className="rounded-sm mb-4 py-5"
                />
              </div>

              <div>
                <FieldLabel htmlFor="publication_year">Publication Year</FieldLabel>
                <Input
                  id="publication_year"
                  type="text"
                  name="publication_year"
                  value={form.publication_year}
                  onChange={handleInput}
                  placeholder="YYYY"
                  className="rounded-sm mb-4 py-5"
                />
              </div>

              <div>
                <FieldLabel htmlFor="language">Language</FieldLabel>
                <Input
                  id="language"
                  type="text"
                  name="language"
                  value={form.language}
                  onChange={handleInput}
                  placeholder="Input language"
                  className="rounded-sm mb-4 py-5"
                />
              </div>

              <div>
                <FieldLabel htmlFor="qty">Quantity</FieldLabel>
                <Input
                  id="qty"
                  type="number"
                  name="qty"
                  value={form.qty}
                  onChange={handleInput}
                  placeholder="Input quantity"
                  className="rounded-sm mb-4 py-5"
                />
              </div>

              <div>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <Select
                  value={form.status !== "" && form.status !== null && form.status !== undefined ? String(form.status) : ""}
                  onValueChange={(val) => {setForm((pre) => ({...pre,status: Number(val)}))}}
                >
                  <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                    <SelectValue placeholder="Select status">
                      {form.status !== "" && form.status !== null && form.status !== undefined ?
                        items.find((e) => String(e.value) === String(form.status))?.label
                        : "Select status"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup >
                      {items.map((item) => (
                        <SelectItem key={item.value} value={String(item.value)}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div>
                  <FieldLabel htmlFor="image">Image</FieldLabel>
                  <label htmlFor="image" className={`mt-1 flex flex-col items-center justify-center w-full h-full min-h-[13rem] border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${isDarkMode ? "border-slate-600 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-500" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}>
                    {previewImage ? (
                      <div className="relative w-full h-full p-2 group flex justify-center items-center">
                        <img src={previewImage} alt="Preview" className="max-w-full max-h-48 object-contain rounded-md shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/150x150?text=No+Img"; }} />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md m-2 text-white backdrop-blur-[2px]">
                          <span className="font-semibold text-sm flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full shadow-lg">
                            <BiSolidEdit className="text-lg" />
                            Change Image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className={`p-3 mb-4 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-blue-50 text-blue-500'}`}>
                          <svg className="w-8 h-8" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                          </svg>
                        </div>
                        <p className={`mb-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}><span className="font-semibold text-blue-500 hover:text-blue-600 hover:underline">Click to upload</span></p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>SVG, PNG, JPG or GIF</p>
                      </div>
                    )}
                    <input id="image" name="image" type="file" accept="image/*" className="hidden" onChange={handleInput} />
                  </label>
                </div>

              </div>

              <div className="mt-4">
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <textarea 
                  id="description"
                  name="description"
                  rows={10}
                  value={form.description}
                  onChange={handleInput}
                  placeholder="Input description" 
                  className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Field>

          {/* Book Copy  */}

          <div className='my-8'>
            <div className='my-3'>
              <button 
                type="button"
                onClick={handleAddRow}
                className={`flex items-center duration-300 gap-2 ${isDarkMode ? "bg-blue-500/30 text-white/60" : "bg-blue-500/80"} rounded-xs hover:bg-blue-700 cursor-pointer hover:text-white text-white px-2 py-2`}
              >
                <span className='text-xl font-bold'><IoMdAddCircleOutline /></span>
                <span>Add Book-Copy</span>
              </button>
            </div>

            <Table className={`${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} ${Loading ? "opacity-60 pointer-events-none" : "opacity-100"} transition-opacity duration-300`}>

              <TableHeader  className="text-lg text-white ">
                <TableRow className={`${isDarkMode ? "bg-pink-500/20" : "  text-black"}`}>
                  <TableHead className={`${isDarkMode ? "text-white/70" : "text-black/70 text-sm"} w-[10px]`}>No</TableHead>
                  <TableHead className={`${isDarkMode ? "text-white/70" : "text-black/70 text-sm"}`}>Barcode</TableHead>
                  <TableHead className={`${isDarkMode ? "text-white/70" : "text-black/70 text-sm"}`}>Page-Number</TableHead>
                  <TableHead className={`${isDarkMode ? "text-white/70" : "text-black/70 text-sm"}`}>Shelf-Location</TableHead>
                  <TableHead className={`${isDarkMode ? "text-white/70" : "text-black/70 text-sm"}`}>Buy-Date</TableHead>
                  <TableHead className={`${isDarkMode ? "text-white/70" : "text-black/70 text-sm"}`}>Price</TableHead>
                  <TableHead className={`${isDarkMode ? "text-white/70" : "text-black/70 text-sm"}`}>Condition</TableHead>
                  <TableHead className={`${isDarkMode ? "text-white/70" : "text-black/70 text-sm"}`}>Status</TableHead>
                  <TableHead className={`${isDarkMode ? "text-white/70" : "text-black/70 text-sm"} text-center w-10`}>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className='text-[16px] border-none'>
                {row.map((rows,index) =>(
                  <TableRow key={rows.id} className='border-b-0'>
                    <TableCell>
                      {index+1}
                    </TableCell>

                    <TableCell>
                      <Input
                        id="barcode"
                        type="text"
                        name="barcode"
                        value={rows.barcode}
                        onChange={(e) => handleInputChange(rows.id, 'barcode', e.target.value)}
                        placeholder="Input barcode"
                        className={`rounded-sm py-2 text-sm transition-colors duration-300 ${
                          rows.barcode !== "" && rows.barcode !== null && rows.barcode !== undefined ? 'bg-blue-100/50' : 'bg-transparent'
                        }`}
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        id="page_number"
                        type="text"
                        name="page_number"
                        value={rows.page_number}
                        onChange={(e) => handleInputChange(rows.id, 'page_number',e.target.value)}
                        placeholder="Input pageNumber"
                        className={`rounded-sm py-2 text-sm transition-colors duration-300 ${
                          rows.page_number !== "" && rows.page_number !== null && rows.page_number !== undefined ? 'bg-blue-100/50' : 'bg-transparent'
                        }`}
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        id="shelf_location"
                        type="text"
                        name="shelf_location"
                        value={rows.shelf_location}
                        onChange={(e) =>handleInputChange(rows.id, 'shelf_location',e.target.value)}
                        placeholder="Input location"
                        className={`rounded-sm py-2 text-sm transition-colors duration-300 ${
                          rows.shelf_location !== "" && rows.shelf_location !== null && rows.shelf_location !== undefined ? 'bg-blue-100/50' : 'bg-transparent'
                        }`}
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        id="acquisition_date"
                        type="date"
                        name="acquisition_date"
                        value={rows.acquisition_date}
                        onChange={(e) => handleInputChange(rows.id, 'acquisition_date',e.target.value)}
                        placeholder="Input buyDate"
                        className={`rounded-sm py-2 text-sm transition-colors duration-300 ${
                          rows.acquisition_date !== "" && rows.acquisition_date !== null && rows.acquisition_date !== undefined ? 'bg-blue-100/50' : 'bg-transparent'
                        }`}
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        id="price"
                        type="text"
                        name="price"
                        value={rows.price}
                        onChange={(e) =>handleInputChange(rows.id, 'price', e.target.value)}
                        placeholder="Input price"
                        className={`rounded-sm py-2 text-sm transition-colors duration-300 ${
                          rows.price !== "" && rows.price !== null && rows.price !== undefined ? 'bg-blue-100/50' : 'bg-transparent'
                        }`}
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        id="condition"
                        type="text"
                        name="condition"
                        value={rows.condition}
                        onChange={(e) =>handleInputChange(rows.id, 'condition', e.target.value)}
                        placeholder="Input condition"
                        className={`rounded-sm py-2 text-sm transition-colors duration-300 ${
                          rows.condition !== "" && rows.condition !== null && rows.condition !== undefined ? 'bg-blue-100/50' : 'bg-transparent'
                        }`}
                      />
                    </TableCell>

                    <TableCell>

                      <Select
                        value={rows.status !== "" && rows.status !== null && rows.status !== undefined ? String(rows.status) : ""}
                        
                        onValueChange={(val) => handleInputChange(rows.id, 'status', Number(val))}
                      >
                        <SelectTrigger 
                          className={`w-full rounded-sm py-2 transition-colors duration-300 ${
                            rows.status !== "" && rows.status !== null && rows.status !== undefined ? 'bg-blue-100/50' : 'bg-transparent'
                          }`}
                        >
                          <SelectValue placeholder="Select status">
                            {rows.status !== "" && rows.status !== null && rows.status !== undefined
                              ? items.find((item) => String(item.value) === String(rows.status))?.label
                              : "Select status"}
                          </SelectValue>
                          
                        </SelectTrigger>
                        
                        <SelectContent>
                          <SelectGroup>
                            {items.map((item) => (
                              <SelectItem key={item.value} value={String(item.value)}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                    </TableCell>

                    

                    <TableCell className=" flex justify-center ">
                      <div className="flex items-center justify-center ">

                        <button
                          onClick={()=>handleDeleteRow(rows.id)}
                          type="button"
                          aria-label="Delete"
                          className="group cursor-pointer flex h-8 w-8 items-center justify-center rounded-sm border border-rose-200 text-rose-500 transition-all duration-200 hover:border-rose-200 hover:bg-rose-100 active:scale-95 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10"
                        >
                          <MdDelete className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
              </TableBody>

                
            </Table>
          </div>

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

export default BookCreate