import api from '@/service/api';
import React, { useContext, useEffect, useState } from 'react'
import { useParams,useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/toast"
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from '@base-ui/react/button';
import { Spinner } from '@/components/ui/spinner';
import { TiArrowBackOutline } from "react-icons/ti";
import { MdOutlineSaveAlt } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi"
import { GlobleContext } from '@/globleContext/GlobleContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PublishersCreate = () => {
    const {isDarkMode} = useContext(GlobleContext);
    const [Loading,setLoading] = useState(false);
    const {id} = useParams();
    const navigate = useNavigate();
    const isEditeMode = Boolean(id);
    const [form,setForm] = useState({
        publishers_name: "",
        phone: "",
        email: "",
        address: "",
        status: ""
    });

    const getData = async() =>{
        try{
            setLoading(true);
            const res = await api.get(`publishers/${id}`)
            const result =res.data.data;
            setForm({
                publishers_name: result.publishers_name || '',
                phone: result.phone || '',
                email: result.email || '',
                address: result.address || '',
                status: result.status || ''
            });
        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        if(isEditeMode){
            getData();
        }
    },[id,isEditeMode])

    const handleReset = () =>{
        setForm({
            publishers_name: "",
            phone: "",
            email: "",
            address: "",
            status: ""
        });
    }

    const handleInput = (e) =>{
        const {name,value} = e.target;
        setForm((pre) => ({...pre,[name]:value}));
    }

    const handleSubmit = async(e) =>{
        e.preventDefault();
        try{
            setLoading(true);
            let res;
            if(isEditeMode){
                res = await api.put(`publishers/${id}`,form);
            }
            else{
                res = await api.post('publishers',form);
            }
            const ids = toast.add({
                description: res.data?.message ,
                actionProps: {
                    children: "Undo",
                    onClick() {
                        toast.close(ids)
                    },
                },
            })

            handleReset();
            getData();
            navigate('/publishers')
        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }
    const items = [
        { label: "Active", value: 1 },
        { label: "Inactive", value: 0 },
    ]
    


    return (
        <div>
            <div className={`flex justify-between items-center bg-blend-darken p-4 mb-3 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
                    {isEditeMode ? "Update Publishers" : "Create Publishers"}
                </div>
                <button 
                    onClick={()=>navigate('/publishers')}
                    className={`flex items-center duration-300 gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-2 py-1`}
                >
                    <span className='text-xl font-bold'><TiArrowBackOutline /></span>
                    <span>Back</span>
                </button>
            </div>

            <div className={` ${isDarkMode ? " bg-white/2 text-white/50 " : " bg-white "} rounded-sm mx-auto mt-10 p-6  shadow-sm border-2`}>
                <form onSubmit={handleSubmit}>
                    <Field>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                            <div>
                                <FieldLabel htmlFor="authors_name">Publisher Name</FieldLabel>
                                <Input
                                    id="publishers_name"
                                    type="text"
                                    name="publishers_name"
                                    value={form.publishers_name}
                                    onChange={handleInput}
                                    placeholder="Input publisher name"
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="authors_name">Phone</FieldLabel>
                                <Input
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleInput}
                                    placeholder="Input phone"
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="authors_name">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={form.email}
                                    onChange={handleInput}
                                    placeholder="Input email"
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="authors_name">Status</FieldLabel>
                                <Select items={items}
                                    value={form.status !== "" && form.status !== null && form.status !== undefined ? String(form.status) : ""}
                                    onValueChange={(val) => {setForm((pre) => ({...pre,status: Number(val)}))}}
                                >
                                    <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                                        <SelectValue placeholder="Select status">
                                            {form.status !== "" && form.status !== null && form.status !== undefined ?
                                                items.find((e) => String(e.value) === String(form.status))?.label : "Select status"
                                            }
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup >
                                            {items.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>

                                </Select>
                            </div>
                        </div>

                        <FieldLabel htmlFor="biography">Address</FieldLabel>
                        <textarea 
                            id="address"
                            name="address"
                            rows={4}
                            value={form.address}
                            onChange={handleInput}
                            placeholder="Input address" 
                            className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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

export default PublishersCreate