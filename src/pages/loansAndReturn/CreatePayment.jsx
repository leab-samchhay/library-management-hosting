import { GlobleContext } from '@/globleContext/GlobleContext'
import api from '@/service/api';
import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from '@base-ui/react/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from "@/components/ui/toast";
import { TiArrowBackOutline } from "react-icons/ti";
import { MdOutlineSaveAlt } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CreatePayment = () => {
    const {isDarkMode} = useContext(GlobleContext);
    const user = useSelector((state) => state.auth.user);
    const [Loading,setLoading] = useState(false);
    const navigate = useNavigate();

    const {id} = useParams();
    const isEditeMode = Boolean(id);

    const [form,setForm] = useState({
        fine_id: "",
        amount: "",
        payment_date: "",
        payment_method: "",
        received_by: user ? String(user.id) : "",
        note: ""
    });

    useEffect(() => {
        if(user){
            setForm(prev => ({...prev, received_by: String(user.id)}));
        }
    }, [user]);

    const [finesData, setFinesData] = useState([]);

    const getDependencies = async () => {
        try {
            const res = await api.get('fines');
            setFinesData(res.data.data.data || res.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(()=>{
        getDependencies();
    })

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
            received_by: user ? String(user.id) : "",
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
            navigate('/loansReturn/homeLoan')
        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 75 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
        >
           
            <div className={` ${isDarkMode ? " bg-white/2 text-white/50 " : " bg-white "} rounded-sm mx-auto  p-6  shadow-sm border-2`}>
               
                <div className={`mb-4 ${isDarkMode ? 'bg-blue-600/80' : 'bg-blue-500/80'} py-2.5 px-3 rounded-xs flex justify-between items-center`}>
                    <div className="text-white font-medium">Information Payment</div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Field className='grid grid-cols-1 md:grid-cols-2'>
                        <div>
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
                        </div>
                        
                        <div>
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
                        </div>

                        <div>
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
                        </div>

                        

                        <div>
                            <FieldLabel htmlFor="received_by">Received By (Staff Name)</FieldLabel>
                            <Input
                                id="received_by"
                                type="text"
                                name="received_by"
                                value={user ? user.name : ""}
                                readOnly
                                placeholder="Input receiver name"
                                className={`rounded-sm mb-4 py-5 cursor-not-allowed opacity-70 ${isDarkMode ? 'bg-black/40 border-gray-600 text-white' : 'bg-gray-100'}`}
                            />
                        </div>

                        

                    </Field>
                    <div>
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
                    </div>

                    <div>
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
                    </div>

                    <div className='flex gap-2'>
                        <Button 
                            type="submit" 
                            disabled={Loading} 
                            className={`${isDarkMode ? " bg-blue-500/40 text-white/60 " : " bg-blue-500/80 text-white "}  hover:bg-blue-700 duration-300 px-4 py-2 rounded-sm flex justify-center items-center gap-2 mt-5  cursor-pointer font-medium disabled:opacity-50`}
                        >
                            <span className='text-xl'>{isEditeMode ? <BiSolidEdit /> : <MdOutlineSaveAlt />}</span>
                            {isEditeMode ? "Update" : "payment"} {Loading && <Spinner />}
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
        </motion.div>
    )
}

export default CreatePayment

