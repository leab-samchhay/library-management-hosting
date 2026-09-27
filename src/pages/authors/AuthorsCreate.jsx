import api from '@/service/api';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from '@base-ui/react/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from "@/components/ui/toast";
import { GlobleContext } from '@/globleContext/GlobleContext';
import { TiArrowBackOutline } from "react-icons/ti";
import { MdOutlineSaveAlt } from "react-icons/md";
import { BiSolidEdit } from "react-icons/bi";

const AuthorsCreate = () => {
    const {isDarkMode} = useContext(GlobleContext)
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {id} = useParams();
    const isEditeMode = Boolean(id);

    const [form, setForm] = useState({
        authors_name: "",
        biography: ""
    });

    const getData = async () => {
        try{
            setLoading(true);
            const res = await api.get(`authors/${id}`);
            const data = res.data.data;
            setForm({
                authors_name: data.authors_name || "",
                biography: data.biography || ""
            });
        }
        catch(error){
            console.log(error)
        }finally{
            setLoading(false);
        }
    }

    useEffect(() =>{
        if(isEditeMode){
            getData();
        }
    },[id,isEditeMode])

    const handleReset = () => {
        setForm({
            authors_name: "",
            biography: "",
        });
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let res;
            if(isEditeMode){
                res = await api.put(`authors/${id}`,form);
            }else{
                res = await api.post('authors',form);
            }


            if (toast && toast.add) {
                toast.add({
                    type: "success",
                    description: res.data?.message || "Author has been created.",
                    timeout: 3000,
                });
            }

            setForm({
                authors_name: "",
                biography: ""
            });

            navigate('/authors');
        } catch (error) {
            console.error("Failed to create author:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className={`flex justify-between items-center bg-blend-darken p-4 mb-5 ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}  rounded-sm`}>
                <div className={`text-2xl text-white ${isDarkMode ? " text-white/60" : "text-white"}`}>
                    {isEditeMode ? "Update Authors" : "Create Authors"}
                </div>
                <button 
                    onClick={()=>navigate('/authors')}
                    className={`flex items-center duration-300 gap-2 ${isDarkMode ? "bg-black/30 text-white/60" : "bg-white"} rounded-xs hover:bg-pink-300 cursor-pointer hover:text-white text-blue-500/80 px-2 py-1`}
                >
                    <span className='text-xl font-bold'><TiArrowBackOutline /></span>
                    <span>Back</span>
                </button>
            </div>
            
            <div className={` ${isDarkMode ? " bg-white/2 text-white/50 " : " bg-white "} rounded-sm mx-auto mt-10 p-6  shadow-sm border-2`}>
                <form onSubmit={handleSubmit}>
                    <Field>
                        <FieldLabel htmlFor="authors_name">Name</FieldLabel>
                        <Input
                            id="authors_name"
                            type="text"
                            name="authors_name"
                            value={form.authors_name}
                            onChange={handleInput}
                            placeholder="Input your name"
                            className="rounded-sm mb-4 py-5"
                            required
                        />

                        <FieldLabel htmlFor="biography">Biography</FieldLabel>
                        <textarea 
                            id="biography"
                            name="biography"
                            rows={4}
                            value={form.biography}
                            onChange={handleInput}
                            placeholder="Input your biography" 
                            className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </Field>

                    <div className='flex gap-2'>
                        <Button 
                            type="submit" 
                            disabled={loading} 
                            className={`${isDarkMode ? " bg-blue-500/40 text-white/60 " : " bg-blue-500/80 text-white "}  hover:bg-blue-700 duration-300 px-4 py-2 rounded-sm flex justify-center items-center gap-2 mt-5  cursor-pointer font-medium disabled:opacity-50`}
                        >
                            <span className='text-xl'>{isEditeMode ? <BiSolidEdit /> : <MdOutlineSaveAlt />}</span>
                            {isEditeMode ? "Update" : "Create"} {loading && <Spinner />}
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
    );
};

export default AuthorsCreate;