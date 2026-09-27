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

const FinesCreate = () => {
    const {isDarkMode} = useContext(GlobleContext);
    const [Loading,setLoading] = useState(false);
    const navigate = useNavigate();

    const {id} = useParams();
    const isEditeMode = Boolean(id);

    const [form,setForm] = useState({
        return_id: "",
        fine_type: "",
        amount: "",
        status: ""
    });

    const [returnData, setReturnData] = useState([]);

    const getDependencies = async () => {
        try {
            const res = await api.get('book-returns');
            setReturnData(res.data.data.data || res.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const getData = async()=>{
        try{
            setLoading(true);
            const res = await api.get(`fines/${id}`);
            const result = res.data.data;
            setForm({
                return_id: result.return_id || "",
                fine_type: result.fine_type || "",
                amount: result.amount || "",
                status: result.status || ""
            });
        }
        catch(error){
            console.log(error)
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        getDependencies();
        if(isEditeMode){
            getData();
        }
    },[id,isEditeMode])

    const handleReset = () => {
        setForm({
            return_id: "",
            fine_type: "",
            amount: "",
            status: ""
        });
    };

    const handleInput = (e) => {
        const {name,value} = e.target;
        setForm((pre) => ({...pre,[name]: value}));
    }

    const handleSubmit = async(e) =>{
        e.preventDefault();
        try{
            setLoading(true);
            let res ;
            if(isEditeMode){
                res = await api.put(`fines/${id}`,form);
            }
            else{
                res = await api.post('fines',form);
            }

            if (toast && toast.add) {
                toast.add({
                    type: "success",
                    description: res.data?.message || "Fine has been saved successfully.",
                    timeout: 3000,
                });
            }
            handleReset();
            navigate('/fines')
        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <div>
            <div className={`flex justify-between items-center bg-blend-darken p-4 mb-5 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
                    {isEditeMode ? "Update Fine" : "Create Fine"}
                </div>
                <button 
                    onClick={()=>navigate('/fines')}
                    className={`flex items-center duration-300 gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-2 py-1`}
                >
                    <span className='text-xl font-bold'><TiArrowBackOutline /></span>
                    <span>Back</span>
                </button>
            </div>

            <div className={` ${isDarkMode ? " bg-white/2 text-white/50 " : " bg-white "} rounded-sm mx-auto mt-10 p-6  shadow-sm border-2`}>
                <form onSubmit={handleSubmit}>
                    <Field>
                        <FieldLabel htmlFor="return_id">Return ID</FieldLabel>
                        <Select 
                            value={form.return_id !== "" && form.return_id !== null && form.return_id !== undefined ? String(form.return_id) : ""}
                            onValueChange={(val) => {setForm((pre) => ({...pre,return_id: Number(val)}))}}
                        >
                            <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                                <SelectValue placeholder="Select Return ID">
                                    {form.return_id ?
                                        returnData.find((e) => String(e.id) === String(form.return_id))?.id ? `Return #${form.return_id}` : "Unknown"
                                        : "Select Return ID"
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup >
                                    {returnData.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                            Return #{item.id}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <FieldLabel htmlFor="fine_type">Fine Type</FieldLabel>
                        <Input
                            id="fine_type"
                            type="text"
                            name="fine_type"
                            value={form.fine_type}
                            onChange={handleInput}
                            placeholder="Input fine type"
                            className="rounded-sm mb-4 py-5"
                        />
                        
                        <FieldLabel htmlFor="amount">Amount</FieldLabel>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            name="amount"
                            value={form.amount}
                            onChange={handleInput}
                            placeholder="Input amount"
                            className="rounded-sm mb-4 py-5"
                            required
                        />

                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <Input
                            id="status"
                            type="text"
                            name="status"
                            value={form.status}
                            onChange={handleInput}
                            placeholder="Input status"
                            className="rounded-sm mb-4 py-5"
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

export default FinesCreate
