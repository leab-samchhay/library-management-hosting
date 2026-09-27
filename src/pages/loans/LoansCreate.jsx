import api from '@/service/api';
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
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

const LoansCreate = () => {
    const {isDarkMode} =useContext(GlobleContext)
    const [Loading,setLoading] = useState(false);
    const [member,setMember] = useState([]);
    const {id} = useParams();
    const isEditeMode = Boolean(id);
    const navigate = useNavigate();
    const [form,setForm] = useState({
        member_id: "",
        staff_id: "",
        loan_date: "",
        due_date: "",
        note: "",
        status: "",
    })

    const getData = async() => {
        try{
            setLoading(true)
            const res = await api.get(`loans/${id}`);
            const resul = res.data.data;
            setForm({
                member_id: resul.member_id || '',
                staff_id: resul.staff_id || '',
                loan_date: resul.loan_date || '',
                due_date: resul.due_date || '',
                note: resul.note || '',
                status: resul.status || ''
            });
        }
        catch(error){
            console.log(error);
        }
        finally{
            setLoading(false);
        }
    }

    const getDataMember = async() =>{
        try{
            setLoading(true);
            const res = await api.get("members");
            setMember(res.data.data.data || []);
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
        getDataMember();
    },[id,isEditeMode])

    const handleReset = () =>{
        setForm({
            member_id: "",
            staff_id: "",
            loan_date: "",
            due_date: "",
            note: "",
            status: "",
        })
    }

    const handleInput = (e) =>{
        const {name,value} = e.target;
        setForm((pre) =>({...pre,[name]:value}));
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            setLoading(true);
            let res;
            if(isEditeMode){
                res = await api.put(`loans/${id}`,form);
            }
            else{
                res = await api.post("loans",form);
            }
            const ids = toast.add({
                description: res.data?.message || "Success",
                actionProps: {
                    children: "Close",
                    onClick() {
                        toast.close(ids)
                    },
                },
            });
            handleReset();
            navigate("/loans");
        }
        catch(error){
            console.error(error);
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            toast.add({
                description: errorMessage,
                actionProps: {
                    children: "Close",
                    onClick() {
                        // close
                    },
                },
            });
        }
        finally{
            setLoading(false);
        }
    }

    const items = [
        { label: "Borrowed", value: 1 },
        { label: "Returned", value: 0 },
    ]

    return (
        <div>
            <div className={`flex justify-between items-center bg-blend-darken p-4 mb-3 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
                    {isEditeMode ? "Update Loan" : "Create Loan"}
                </div>
                <button 
                    onClick={()=>navigate('/loans')}
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
                                <FieldLabel htmlFor="member_id">Member</FieldLabel>
                                <Select
                                    value={form.member_id !== "" && form.member_id !== null && form.member_id !== undefined ? String(form.member_id) : ""}
                                    onValueChange={(val) => {setForm((pre) => ({...pre,member_id: Number(val)}))}}
                                >
                                    <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                                        <SelectValue placeholder="Select member">
                                            {form.member_id ? 
                                                (() => {
                                                    const m = member.find((e) => String(e.id) === String(form.member_id));
                                                    return m ? `${m.first_name} ${m.last_name}` : "Unknown Member";
                                                })()
                                                : "Select member"
                                            }
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup >
                                            {member.map((item) => (
                                                <SelectItem key={item.id} value={String(item.id)}>
                                                    {item.id} - {item.first_name} {item.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>

                                </Select>
                            </div>

                            <div>
                                <FieldLabel htmlFor="staff_id">Staff</FieldLabel>
                                <Input
                                    id="staff_id"
                                    type="text"
                                    name="staff_id"
                                    value={form.staff_id}
                                    onChange={handleInput}
                                    placeholder="Input staff id"
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="loan_date">Loan Date</FieldLabel>
                                <Input
                                    id="loan_date"
                                    type="date"
                                    name="loan_date"
                                    value={form.loan_date}
                                    onChange={handleInput}
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                                <Input
                                    id="due_date"
                                    type="date"
                                    name="due_date"
                                    value={form.due_date}
                                    onChange={handleInput}
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>
                        </div>

                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <Select items={items}
                            value={form.status !== "" && form.status !== null && form.status !== undefined ? String(form.status) : ""}
                            onValueChange={(val) => {setForm((pre) => ({...pre,status: String(val)}))}}
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
                                        <SelectItem key={item.value} value={String(item.value)}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>

                        </Select>

                        <FieldLabel htmlFor="note">Note</FieldLabel>
                        <textarea 
                            id="note"
                            name="note"
                            rows={4}
                            value={form.note}
                            onChange={handleInput}
                            placeholder="Input note" 
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

export default LoansCreate