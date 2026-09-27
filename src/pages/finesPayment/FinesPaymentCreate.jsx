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

const FinesPaymentCreate = () => {
    const {isDarkMode} = useContext(GlobleContext);
    const [Loading,setLoading] = useState(false);
    const navigate = useNavigate();

    const {id} = useParams();
    const isEditeMode = Boolean(id);

    const [form,setForm] = useState({
        fine_id: "",
        amount: "",
        payment_date: "",
        payment_method: "",
        received_by: "",
        note: ""
    });

    const [finesData, setFinesData] = useState([]);

    const getDependencies = async () => {
        try {
            const res = await api.get('fines');
            setFinesData(res.data.data.data || res.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const getData = async()=>{
        try{
            setLoading(true);
            const res = await api.get(`fine-payments/${id}`);
            const result = res.data.data;
            setForm({
                fine_id: result.fine_id || "",
                amount: result.amount || "",
                payment_date: result.payment_date || "",
                payment_method: result.payment_method || "",
                received_by: result.received_by || "",
                note: result.note || ""
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
            fine_id: "",
            amount: "",
            payment_date: "",
            payment_method: "",
            received_by: "",
            note: ""
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
                res = await api.put(`fine-payments/${id}`,form);
            }
            else{
                res = await api.post('fine-payments',form);
            }

            if (toast && toast.add) {
                toast.add({
                    type: "success",
                    description: res.data?.message || "Payment has been saved successfully.",
                    timeout: 3000,
                });
            }
            handleReset();
            navigate('/finesPayment')
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
                    {isEditeMode ? "Update Fine Payment" : "Create Fine Payment"}
                </div>
                <button 
                    onClick={()=>navigate('/finesPayment')}
                    className={`flex items-center duration-300 gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-2 py-1`}
                >
                    <span className='text-xl font-bold'><TiArrowBackOutline /></span>
                    <span>Back</span>
                </button>
            </div>

            <div className={` ${isDarkMode ? " bg-white/2 text-white/50 " : " bg-white "} rounded-sm mx-auto mt-10 p-6  shadow-sm border-2`}>
                <form onSubmit={handleSubmit}>
                    <Field>
                        <FieldLabel htmlFor="fine_id">Fine ID</FieldLabel>
                        <Select 
                            value={form.fine_id !== "" && form.fine_id !== null && form.fine_id !== undefined ? String(form.fine_id) : ""}
                            onValueChange={(val) => {
                                const selectedFine = finesData.find((e) => String(e.id) === String(val));
                                setForm((pre) => ({
                                    ...pre,
                                    fine_id: Number(val),
                                    amount: selectedFine ? selectedFine.amount : pre.amount,
                                    payment_date: new Date().toISOString().split('T')[0]
                                }));
                            }}
                        >
                            <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                                <SelectValue placeholder="Select Fine ID">
                                    {form.fine_id ?
                                        finesData.find((e) => String(e.id) === String(form.fine_id))?.id ? `Fine #${form.fine_id}` : "Unknown"
                                        : "Select Fine ID"
                                    }
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup >
                                    {finesData.filter(item => item.status !== "Paid" || String(item.id) === String(form.fine_id)).map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                            Fine #{item.id} - ${item.amount}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        
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

                        <FieldLabel htmlFor="payment_date">Payment Date</FieldLabel>
                        <Input
                            id="payment_date"
                            type="date"
                            name="payment_date"
                            value={form.payment_date}
                            onChange={handleInput}
                            className="rounded-sm mb-4 py-5"
                            required
                        />

                        <FieldLabel htmlFor="payment_method">Payment Method</FieldLabel>
                        <Input
                            id="payment_method"
                            type="text"
                            name="payment_method"
                            value={form.payment_method}
                            onChange={handleInput}
                            placeholder="Input payment method (e.g., Cash, Card)"
                            className="rounded-sm mb-4 py-5"
                        />

                        <FieldLabel htmlFor="received_by">Received By</FieldLabel>
                        <Input
                            id="received_by"
                            type="text"
                            name="received_by"
                            value={form.received_by}
                            onChange={handleInput}
                            placeholder="Input receiver name"
                            className="rounded-sm mb-4 py-5"
                        />

                        <FieldLabel htmlFor="note">Note</FieldLabel>
                        <textarea 
                            id="note"
                            name="note"
                            rows={4}
                            value={form.note}
                            onChange={handleInput}
                            placeholder="Input note" 
                            className="w-full border border-gray-300 rounded-sm p-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default FinesPaymentCreate
