import api from '@/service/api';
import { motion } from 'framer-motion';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/toast";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from '@base-ui/react/button';
import { Spinner } from '@/components/ui/spinner';
import { TiArrowBackOutline } from "react-icons/ti";
import { MdOutlineSaveAlt } from "react-icons/md";
import { GlobleContext } from '@/globleContext/GlobleContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AddNewMember = () => {
  const { isDarkMode } = useContext(GlobleContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initialFormState = {
    member_code: "",
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    email: "",
    address: ""
  };

  const [form, setForm] = useState(initialFormState);

  const handleReset = () => {
    setForm(initialFormState);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('members', form);

      const newMemberId = res.data?.data?.id;

      const toastId = toast.add({
        description: res.data?.message || "Member created successfully",
        actionProps: {
          children: "Close",
          onClick() {
            toast.close(toastId);
          },
        },
      });

      handleReset();
      navigate('/loansReturn/loansBook', { state: { newMemberId } });
    } catch (error) {
      console.error("API Error Details:", error.response?.data || error.message);

      // Extract error message from API response if present
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(" ")
          : "Failed to create member. Please check required fields.");

      toast.add({
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const genderItems = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 75 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className={`flex justify-between items-center p-3 rounded-sm ${isDarkMode ? "bg-blue-500/20" : "bg-blue-500/80"}`}>
        <div className="text-lg text-white font-medium">
          Create Member
        </div>
        <button
          type="button"
          onClick={() => navigate('/loansReturn/loansBook')}
          className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${
            isDarkMode ? "bg-black/30 text-white hover:bg-black/50" : "bg-white text-blue-600 hover:bg-slate-100"
          }`}
        >
          <TiArrowBackOutline className="text-lg" />
          <span>Back</span>
        </button>
      </div>

      <div className={`rounded-sm mt-3 p-4 shadow-sm border ${isDarkMode ? "bg-white/5 border-slate-800 text-white" : "bg-white border-slate-200"}`}>
        <form onSubmit={handleSubmit}>
          <Field>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="member_code">Member Code</FieldLabel>
                <Input
                  id="member_code"
                  type="text"
                  name="member_code"
                  value={form.member_code}
                  onChange={handleInput}
                  placeholder="Input member code"
                  className="rounded-sm mb-4 py-3"
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
                  className="rounded-sm mb-4 py-3"
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
                  className="rounded-sm mb-4 py-3"
                  required
                />
              </div>

              <div>
                <FieldLabel htmlFor="gender">Gender</FieldLabel>
                <Select
                  value={form.gender}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, gender: String(val) }))}
                >
                  <SelectTrigger className="w-full rounded-sm mb-4 py-3">
                    <SelectValue placeholder="Select gender">
                      {form.gender ? genderItems.find((e) => String(e.value) === String(form.gender))?.label : "Select gender"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
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
                  className="rounded-sm mb-4 py-3 block w-full"
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
                  placeholder="Input phone number"
                  className="rounded-sm mb-4 py-3"
                  required
                />
              </div>
            </div>

            <div className="mt-2">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleInput}
                placeholder="Input email address"
                className="rounded-sm mb-4 py-3"
                required
              />
            </div>

            <div className="mt-2">
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <textarea
                id="address"
                name="address"
                rows={4}
                value={form.address}
                onChange={handleInput}
                placeholder="Input address"
                className={`w-full border rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isDarkMode ? "border-slate-700 bg-transparent text-white" : "border-gray-300 bg-white text-black"
                }`}
              />
            </div>
          </Field>

          <div className="flex gap-3 mt-4">
            <Button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-sm flex justify-center items-center gap-2 cursor-pointer font-medium transition-all disabled:opacity-50 ${
                isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <MdOutlineSaveAlt className="text-xl" />
              <span>Create</span>
              {loading && <Spinner />}
            </Button>

            <Button
              type="button"
              onClick={handleReset}
              className={`border px-5 py-2 rounded-sm flex justify-center items-center gap-2 cursor-pointer font-medium transition-all ${
                isDarkMode
                  ? "text-slate-300 border-slate-700 hover:bg-slate-800"
                  : "text-slate-700 border-slate-300 hover:bg-slate-100"
              }`}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddNewMember;