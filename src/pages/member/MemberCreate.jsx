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

const MemberCreate = () => {
    const {isDarkMode} = useContext(GlobleContext);
    const [Loading,setLoading] = useState(false);
    const {id} = useParams();
    const navigate = useNavigate();
    const isEditeMode = Boolean(id);
    const [form,setForm] = useState({
        member_code: "",
        first_name: "",
        last_name: "",
        gender: "",
        date_of_birth: "",
        phone: "",
        email: "",
        address: ""
    });

    const getData = async() =>{
        try{
            setLoading(true);
            const res = await api.get(`members/${id}`)
            const result = res.data.data;
            setForm({
                member_code: result.member_code || '',
                first_name: result.first_name || '',
                last_name: result.last_name || '',
                gender: result.gender || '',
                date_of_birth: result.date_of_birth || '',
                phone: result.phone || '',
                email: result.email || '',
                address: result.address || ''
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
            member_code: "",
            first_name: "",
            last_name: "",
            gender: "",
            date_of_birth: "",
            phone: "",
            email: "",
            address: ""
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
                res = await api.put(`members/${id}`,form);
            }
            else{
                res = await api.post('members',form);
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
            navigate('/member')
        }
        catch(error){
            console.error("API Error:", error.response?.data || error);
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

    const genderItems = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
    ]

    return (
        <div>
            <div className={`flex justify-between items-center bg-blend-darken p-4 mb-3 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
                    {isEditeMode ? "Update Member" : "Create Member"}
                </div>
                <button 
                    onClick={()=>navigate('/member')}
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
                                <FieldLabel htmlFor="member_code">Member Code</FieldLabel>
                                <Input
                                    id="member_code"
                                    type="text"
                                    name="member_code"
                                    value={form.member_code}
                                    onChange={handleInput}
                                    placeholder="Input your code "
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                                <Input
                                    id="first_name"
                                    type="text"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleInput}
                                    placeholder="Input first name"
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                                <Input
                                    id="last_name"
                                    type="text"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleInput}
                                    placeholder="Input last name"
                                    className="rounded-sm mb-4 py-5"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="gender">Gender</FieldLabel>
                                <Select items={genderItems}
                                    value={form.gender !== "" && form.gender !== null && form.gender !== undefined ? String(form.gender) : ""}
                                    onValueChange={(val) => {setForm((pre) => ({...pre,gender: String(val)}))}}
                                >
                                    <SelectTrigger className="w-full rounded-sm mb-4 py-5">
                                        <SelectValue placeholder="Select gender">
                                            {form.gender ? genderItems.find((e) => String(e.value) === String(form.gender))?.label : "Select gender"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup >
                                            {genderItems.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>

                                </Select>
                            </div>

                            <div>
                                <FieldLabel htmlFor="date_of_birth">Date of Birth</FieldLabel>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    name="date_of_birth"
                                    value={form.date_of_birth}
                                    onChange={handleInput}
                                    className="rounded-sm mb-4 py-5 block w-full"
                                    required
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="phone">Phone</FieldLabel>
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
                        </div>

                        <div>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleInput}
                                placeholder="Input email"
                                className="rounded-sm mb-4 py-5"
                                required
                            />
                        </div>

                        <div>
                            <FieldLabel htmlFor="address">Address</FieldLabel>
                            <textarea 
                                id="address"
                                name="address"
                                rows={4}
                                value={form.address}
                                onChange={handleInput}
                                placeholder="Input address" 
                                className={`w-full border ${isDarkMode ? "border-gray-600 bg-transparent" : "border-gray-300 bg-white"} rounded-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
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
                            className= {` ${isDarkMode ? "text-white/60 border-gray-600" : "text-black border-gray-300"} border-2 hover:bg-gray-100 dark:hover:bg-gray-800 duration-300 px-4 py-2 rounded-sm flex justify-center items-center gap-2 mt-5 cursor-pointer font-medium disabled:opacity-50`}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default MemberCreate