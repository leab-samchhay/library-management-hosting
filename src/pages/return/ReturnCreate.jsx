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

const ReturnCreate = () => {
    const {isDarkMode} = useContext(GlobleContext);
    const [Loading,setLoading] = useState(false);
    const [loanDetails, setLoanDetails] = useState([]);
    const {id} = useParams();
    const navigate = useNavigate();
    const isEditeMode = Boolean(id);
    const [form,setForm] = useState({
        loan_detail_id: "",
        returned_date: "",
        received_by: "",
        note: ""
    });

    const getData = async() =>{
        try{
            setLoading(true);
            const res = await api.get(`book-returns/${id}`)
            const result = res.data.data;
            setForm({
                loan_detail_id: result.loan_detail_id || '',
                returned_date: result.returned_date || '',
                received_by: result.received_by || '',
                note: result.note || ''
            });
        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

    const getDataLoanDetails = async() =>{
        try{
            const res = await api.get('loan-details');
            setLoanDetails(res.data.data.data || []);
        }
        catch(error){
            console.log(error);
        }
    }

    useEffect(() => {
        if(isEditeMode){
            getData();
        }
        getDataLoanDetails();
    },[id,isEditeMode])

    const handleReset = () =>{
        setForm({
            loan_detail_id: "",
            returned_date: "",
            received_by: "",
            note: ""
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
                res = await api.put(`book-returns/${id}`,form);
            }
            else{
                res = await api.post('book-returns',form);
            }
            const ids = toast.add({
                description: res.data?.message || "Success",
                actionProps: {
                    children: "Undo",
                    onClick() {
                        toast.close(ids)
                    },
                },
            })

            handleReset();
            navigate('/bookReturn')
        }
        catch(error){
            console.log(error);
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            toast.add({
                description: errorMessage,
            });
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <div>
            <div className={`flex justify-between items-center bg-blend-darken p-4 mb-3 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
                    {isEditeMode ? "Update Return" : "Create Return"}
                </div>
                <button 
                    onClick={()=>navigate('/bookReturn')}
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
                                <FieldLabel htmlFor="loan_detail_id">Loan Detail</FieldLabel>
                                <Select
                                    value={form.loan_detail_id !== "" && form.loan_detail_id !== null && form.loan_detail_id !== undefined ? String(form.loan_detail_id) : ""}
                                    onValueChange={(val) => {setForm((pre) => ({...pre,loan_detail_id: Number(val)}))}}
                                >
                                    <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                                        <SelectValue placeholder="Select Loan Detail">
                                            {form.loan_detail_id ?
                                                (() => {
                                                    const item = loanDetails.find((e) => String(e.id) === String(form.loan_detail_id));
                                                    return item ? `#ID - ${item.id} (Loan: ${item.loan_id})` : "Unknown Loan Detail";
                                                })()
                                                : "Select Loan Detail"
                                            }
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup >
                                            {loanDetails.map((item) => (
                                                <SelectItem key={item.id} value={String(item.id)}>
                                                #ID - {item.id} (Loan: {item.loan_id})
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>

                                </Select>
                            </div>

                            <div>
                                <FieldLabel htmlFor="returned_date">Return Date</FieldLabel>
                                <Input
                                    id="returned_date"
                                    type="date"
                                    name="returned_date"
                                    value={form.returned_date}
                                    onChange={handleInput}
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>

                            <div className='lg:col-span-2'>
                                <FieldLabel htmlFor="received_by">Received By</FieldLabel>
                                <Input
                                    id="received_by"
                                    type="text"
                                    name="received_by"
                                    value={form.received_by}
                                    onChange={handleInput}
                                    placeholder="Input receiver name"
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>
                        </div>

                        <FieldLabel htmlFor="note">Note</FieldLabel>
                        <textarea 
                            id="note"
                            name="note"
                            rows={4}
                            value={form.note}
                            onChange={handleInput}
                            placeholder="Input note" 
                            className={`w-full border ${isDarkMode ? "bg-black/30 border-gray-600 text-white" : "border-gray-300"} rounded-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                            type="button" 
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

export default ReturnCreate