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

const UserForm = () => {
    const {isDarkMode} = useContext(GlobleContext);
    const [Loading,setLoading] = useState(false);
    const navigate = useNavigate();

    const {id} = useParams();
    const isEditeMode = Boolean(id);

    const [form,setForm] = useState({
        name: "",
        email: "",
        password: "",
        profile: null
    });
    
    const [previewImage, setPreviewImage] = useState(null);

    const getData = async()=>{
        try{
            setLoading(true);
            const res = await api.get(`users/${id}`);
            const result = res.data.user;
            setForm({
                name: result.name || "",
                email: result.email || "",
                password: "", // do not populate password
                profile: null
            });
            if (result.profile) {
                // If it's a full URL, use it, else append storage path
                const imgUrl = result.profile.startsWith('http') 
                    ? result.profile 
                    : `http://127.0.0.1:8000/storage/${result.profile}`;
                setPreviewImage(imgUrl);
            }
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
            name: "",
            email: "",
            password: "",
            profile: null
        });
        setPreviewImage(null);
    };

    const handleInput = (e) => {
        const {name,value} = e.target;
        setForm((pre) => ({...pre,[name]: value}));
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((pre) => ({...pre, profile: file}));
            setPreviewImage(URL.createObjectURL(file));
        }
    }

    const handleSubmit = async(e) =>{
        e.preventDefault();
        try{
            setLoading(true);
            
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("email", form.email);
            if (form.password) {
                formData.append("password", form.password);
            }
            if (form.profile) {
                formData.append("profile", form.profile);
            }

            let res ;
            if(isEditeMode){
                formData.append("_method", "PUT");
                res = await api.post(`users/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }
            else{
                res = await api.post('users', formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
            }

            if (toast && toast.add) {
                toast.add({
                    type: "success",
                    description: res.data?.message || `User has been ${isEditeMode ? 'updated' : 'created'}.`,
                    timeout: 3000,
                });
            }
            handleReset();
            navigate('/user')
        }
        catch(error){
            console.log(error);
            if (toast && toast.add) {
                toast.add({
                    type: "error",
                    description: error.response?.data?.message || "Something went wrong!",
                    timeout: 3000,
                });
            }
        }
        finally{
            setLoading(false);
        }
    }


    return (
        <div>
            <div className={`flex justify-between items-center bg-blend-darken p-4 mb-5 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
                    {isEditeMode ? "Update User" : "Create User"}
                </div>
                <button 
                    onClick={()=>navigate('/user')}
                    className={`flex items-center duration-300 gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-2 py-1`}
                >
                    <span className='text-xl font-bold'><TiArrowBackOutline /></span>
                    <span>Back</span>
                </button>
            </div>

            <div className={` ${isDarkMode ? " bg-white/2 text-white/50 " : " bg-white "} rounded-sm mx-auto mt-10 p-6  shadow-sm border-2`}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Input
                                id="name"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleInput}
                                placeholder="Input name"
                                className="rounded-sm mb-4 py-5"
                                required
                            />
                        </Field>

                        <Field>
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
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleInput}
                                placeholder={isEditeMode ? "Leave blank to keep current password" : "Input password"}
                                className="rounded-sm mb-4 py-5"
                                required={!isEditeMode}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="profile">Profile Image</FieldLabel>
                            <div className="mt-2 flex items-center gap-6">
                                <div className="relative group shrink-0">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile preview" className={`w-28 h-28 object-cover rounded-full border-4 shadow-sm ${isDarkMode ? "border-gray-700" : "border-gray-100"}`} />
                                    ) : (
                                        <div className={`w-28 h-28 flex flex-col items-center justify-center rounded-full border-2 border-dashed transition-colors ${isDarkMode ? "border-gray-600 bg-gray-800 hover:border-blue-400 hover:bg-gray-700" : "border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50"}`}>
                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <span className="text-[10px] text-gray-500 mt-1 font-medium">Upload</span>
                                        </div>
                                    )}
                                    <input
                                        id="profile"
                                        type="file"
                                        name="profile"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {previewImage && (
                                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 pointer-events-none">
                                            <svg className="w-6 h-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-white text-[10px] font-semibold">Change</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                        Profile photo
                                    </p>
                                    <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                        Allowed *.jpeg, *.jpg, *.png
                                        <br />Max size of 2MB
                                    </p>
                                </div>
                            </div>
                        </Field>
                    </div>

                    <div className='flex gap-2 mt-4'>
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

export default UserForm
