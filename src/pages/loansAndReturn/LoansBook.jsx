import { GlobleContext } from "@/globleContext/GlobleContext";
import React, { useContext, useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { toast } from "@/components/ui/toast";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import api from "@/service/api";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate, useLocation } from "react-router-dom";

const LoansBook = () => {
  const { isDarkMode } = useContext(GlobleContext);
  const user = useSelector((state) => state.auth.user);
  const [member, setMember] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [existingLoans, setExistingLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    member_id: "",
    staff_id: user ? user.id : "",
    loan_date: new Date().toISOString().split("T")[0],
    due_date: "",
    note: "",
    status: "1",
  });

  useEffect(() => {
      if(user){
          setForm(prev => ({...prev, staff_id: user.id}));
      }
  }, [user]);


  const getDataMember = async () => {
    try {
      setLoading(true);
      const res = await api.get("members");
      setMember(res.data?.data?.data || res.data?.data || []);
    } catch (error) {
      console.error("Fetch members failed:", error);
      toast.error("មិនអាចទាញយកទិន្នន័យសមាជិក (Member) បានទេ!");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((pre) => ({ ...pre, [name]: value }));
  };

  useEffect(() => {
    getDataMember();
  }, []);

  useEffect(() => {
    if (location.state?.newMemberId && member.length > 0) {
      setForm((prev) => ({ ...prev, member_id: location.state.newMemberId }));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, member, location.pathname, navigate]);

  const fetchExistingLoans = async (memberId) => {
    if (!memberId) {
      setExistingLoans([]);
      return;
    }
    try {
      setLoading(true);
      const [loanDetailsRes, bookCopiesRes] = await Promise.all([
        api.get('loan-details?status=Borrowed&per_page=1000000'),
        api.get('book-copies?per_page=1000000')
      ]);
      const allLoanDetails = loanDetailsRes.data?.data?.data || loanDetailsRes.data?.data || [];
      const allBookCopies = bookCopiesRes.data?.data?.data || bookCopiesRes.data?.data || [];
      const memberLoans = allLoanDetails.filter(
        ld => ld.loan && String(ld.loan.member_id) === String(memberId)
      );
      const displayLoans = memberLoans.map(ld => {
        const bc = allBookCopies.find(b => String(b.id) === String(ld.book_copy_id));
        return {
          id: ld.id,
          book_copy_id: ld.book_copy_id,
          barcode: bc ? bc.barcode : ld.book_copy?.barcode,
          title: bc?.book ? bc.book.title : 'Unknown Title',
          image: bc?.book ? bc.book.image : '',
          is_existing: true
        };
      });
      setExistingLoans(displayLoans);
    } catch (err) {
      console.error('Fetch active loans error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExistingLoans(form.member_id);
  }, [form.member_id]);

  const statusItems = [
    { label: "Borrowed", value: "1" },
    { label: "Returned", value: "0" },
  ];

  // áŸ¡. áž‘áž¶áž‰áž‘áž·áž“áŸ’áž“áž“áŸáž™ážŸáŸ€ážœáž—áŸ…áž–áž¸ localStorage
  const getLoanList = () => {
    const data = JSON.parse(localStorage.getItem("loanBooks") || "[]");
    setLoanData(data);
  };

  useEffect(() => {
    getLoanList();
    const handleUpdate = () => getLoanList();
    window.addEventListener("loanBooksUpdated", handleUpdate);
    return () => window.removeEventListener("loanBooksUpdated", handleUpdate);
  }, []);

  // áŸ¢. áž›áž»áž”ážŸáŸ€ážœáž—áŸ…áž…áŸáž‰áž–áž¸ážáž¶ážšáž¶áž„
  const handleDelete = (barcode) => {
    const filtered = loanData.filter((item) => item.barcode !== barcode);
    localStorage.setItem("loanBooks", JSON.stringify(filtered));
    setLoanData(filtered);
    window.dispatchEvent(new Event("loanBooksUpdated"));
  };

  const handleDeleteAll = () => {
    if (loanData.length === 0) return;

    if (window.confirm("តើអ្នកពិតជាចង់លុបសៀវភៅទាំងអស់ចេញពីបញ្ជីមែនទេ?")) {
      localStorage.removeItem("loanBooks");
      setLoanData([]);
      window.dispatchEvent(new Event("loanBooksUpdated"));
    }
  };



  // áŸ¤. Submit Form áž‘áŸ…áž€áž¶áž“áŸ‹ Database
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.member_id) {
      alert("សូមជ្រើសរើសឈ្មោះ Member!");
      return;
    }

    if (!form.due_date) {
      alert("សូមជ្រើសរើសថ្ងៃកំណត់សង (Due Date)!");
      return;
    }

    if (!loanData || loanData.length === 0) {
      alert("សូមជ្រើសរើសសៀវភៅយ៉ាងហោចណាស់មួយដើម្បីធ្វើការខ្ចី!");
      return;
    }

    if (!form.staff_id) {
      alert("Staff ID is missing. Your session might be incomplete. Please Logout and Login again.");
      return;
    }

    // ážšáŸ€áž”áž…áŸ† payload áž•áŸ’áž‰áž¾áž‘áŸ…áž€áž¶áž“áŸ‹ Backend
    const payload = {
      member_id: Number(form.member_id),
      staff_id: String(form.staff_id),
      loan_date: form.loan_date,
      due_date: form.due_date,
      note: form.note || null,
      status: form.status || "1",
      books: loanData.map((book) => ({
        book_copy_id: Number(book.book_copy_id || book.id),
        return_date: book.return_date || null,
        status: book.status || "Borrowed",
      })),
    };

    try {
      setLoading(true);
      const res = await api.post("loanTransaction", payload);

      if (res && (res.status === 200 || res.status === 201)) {
        const ids = toast.add({
          description: res.data?.message || "ជោគជ័យ!",
          actionProps: {
            children: "Close",
            onClick() {
              toast.close(ids);
            },
          },
          timeout: 3000,
        });

        // ážŸáž˜áŸ’áž¢áž¶áž Storage & Reset Form
        localStorage.removeItem("loanBooks");
        setLoanData([]);
        setForm({
          member_id: "",
          staff_id: user ? user.id : "",
          loan_date: new Date().toISOString().split("T")[0],
          due_date: "",
          note: "",
          status: "1",
        });

        // Trigger Event ážŠáž¾áž˜áŸ’áž”áž¸ Update áž€áž“áŸ’áž›áŸ‚áž„áž•áŸ’ážŸáŸáž„áŸ—
        window.dispatchEvent(new Event("loanBooksUpdated"));
        window.dispatchEvent(new Event("loanSubmitSuccess"));
      }
    } catch (error) {
      console.error("Submit error:", error);
      const errorMsg =
        error.response?.data?.message || "áž˜áž¶áž“áž”áž‰áŸ’áž áž¶áž€áŸ’áž“áž»áž„áž€áž¶ážšážšáž€áŸ’ážŸáž¶áž‘áž»áž€áž‘áž·áž“áŸ’áž“áž“áŸáž™!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 75 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`shadow-sm p-3 border rounded-xs ${isDarkMode ? 'bg-transparent border-gray-700/50' : 'bg-white border-gray-200'}`}
    >
      <div className={`mb-4 ${isDarkMode ? 'bg-blue-600/80' : 'bg-blue-500/80'} py-2.5 px-3 rounded-xs flex justify-between items-center`}>
        <div className="text-white font-medium">Information Loans Book</div>
        <button
          type="button"
          onClick={() => navigate("/loansReturn/loansReturn/addNewMember")}
          className={`text-sm flex items-center gap-1 md:gap-2 ${
            isDarkMode ? "bg-black/30 text-white/60 hover:bg-gray-700 hover:text-white" : "bg-white hover:bg-pink-300 hover:text-white"
          } rounded-xs cursor-pointer text-blue-500/80 px-2.5 py-1.5 transition-all`}
        >
          <span className="text-xl font-bold">
            <IoMdAddCircleOutline />
          </span>
          <span>Add New Member</span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <Field>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Member Field */}
              <div>
                <FieldLabel htmlFor="member_id" className={isDarkMode ? 'text-white/80' : ''}>Member</FieldLabel>
                <Select
                  key={form.member_id ? "has-member" : "empty"}
                  value={form.member_id ? String(form.member_id) : ""}
                  onValueChange={(val) =>
                    setForm((pre) => ({ ...pre, member_id: Number(val) }))
                  }
                >
                  <SelectTrigger className={`w-full rounded-sm mb-4 py-4 ${isDarkMode ? 'bg-black/40 border-gray-600 text-white' : ''}`}>
                    <SelectValue placeholder="Select member">
                      {form.member_id ? 
                        (() => {
                          const m = member.find((e) => String(e.id) === String(form.member_id));
                          return m ? `${m.first_name} ${m.last_name}` : "Select member";
                        })()
                        : "Select member"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                    <SelectGroup>
                      {member.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)} className={isDarkMode ? 'hover:bg-gray-700 focus:bg-gray-700' : ''}>
                          {item.id} - {item.first_name} {item.last_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Staff ID Field */}
              <div>
                <FieldLabel htmlFor="staff_id" className={isDarkMode ? 'text-white/80' : ''}>Staff Name</FieldLabel>
                <Input
                  id="staff_id"
                  type="text"
                  name="staff_id"
                  value={user ? user.name : ""}
                  readOnly
                  placeholder="Input staff id"
                  className={`rounded-sm mb-4 py-4 cursor-not-allowed opacity-70 ${isDarkMode ? 'bg-black/40 border-gray-600 text-white' : 'bg-gray-100'}`}
                  required
                />
              </div>

              {/* Status Field */}
              <div>
                <FieldLabel htmlFor="status" className={isDarkMode ? 'text-white/80' : ''}>Status</FieldLabel>
                <Select
                  value={form.status}
                  onValueChange={(val) =>
                    setForm((pre) => ({ ...pre, status: String(val) }))
                  }
                >
                  <SelectTrigger className={`w-full rounded-sm mb-4 py-4 ${isDarkMode ? 'bg-black/40 border-gray-600 text-white' : ''}`}>
                    <SelectValue placeholder="Select status">
                      {form.status ? statusItems.find((e) => String(e.value) === String(form.status))?.label : "Select status"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                    <SelectGroup>
                      {statusItems.map((item) => (
                        <SelectItem key={item.value} value={item.value} className={isDarkMode ? 'hover:bg-gray-700 focus:bg-gray-700' : ''}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Loan Date Field */}
              <div>
                <FieldLabel htmlFor="loan_date" className={isDarkMode ? 'text-white/80' : ''}>Loan Date</FieldLabel>
                <Input
                  id="loan_date"
                  type="date"
                  name="loan_date"
                  value={form.loan_date}
                  onChange={handleInput}
                  className={`rounded-sm mb-4 py-4 ${isDarkMode ? 'bg-black/40 border-gray-600 text-white' : ''}`}
                  required
                />
              </div>

              {/* Due Date Field */}
              <div>
                <FieldLabel htmlFor="due_date" className={isDarkMode ? 'text-white/80' : ''}>Return Date</FieldLabel>
                <Input
                  id="due_date"
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleInput}
                  className={`rounded-sm mb-4 py-4 ${isDarkMode ? 'bg-black/40 border-gray-600 text-white' : ''}`}
                  required
                />
              </div>

              {/* Note Field */}
              <div>
                <FieldLabel htmlFor="note" className={isDarkMode ? 'text-white/80' : ''}>Note</FieldLabel>
                <Input
                  id="note"
                  type="text"
                  name="note"
                  value={form.note}
                  onChange={handleInput}
                  placeholder="Remarks or note..."
                  className={`rounded-sm mb-4 py-4 ${isDarkMode ? 'bg-black/40 border-gray-600 text-white' : ''}`}
                />
              </div>
            </div>
          </Field>
        </div>

        <div className={`text-lg font-medium my-2 ${isDarkMode ? 'text-white/80' : 'text-black/70'}`}>
          Book Loans Detail
        </div>

        <div>
          <div className="h-64 sm:h-72 w-full overflow-y-auto overflow-x-auto border-2 border-blue-500/30 rounded-sm">
            <Table
              className={`${
                isDarkMode ? "bg-transparent text-white/60" : "bg-white"
              } transition-opacity duration-300 w-full`}
            >
              <TableHeader className="text-sm text-white sticky top-0 z-10 shadow-xs">
                <TableRow
                  className={`${
                    isDarkMode
                      ? "bg-pink-500/40"
                      : "bg-blue-500/80 hover:bg-blue-600 text-white"
                  } w-full`}
                >
                  <TableHead className="text-white w-12 text-center">No</TableHead>
                  <TableHead className="text-white w-20 text-center">Photo</TableHead>
                  <TableHead className="text-white">Book Title </TableHead>
                  <TableHead className="text-white"> Barcode</TableHead>
                  <TableHead className="text-white text-center w-24">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {[...existingLoans, ...loanData].length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-gray-400"
                    >
                      មិនទាន់មានសៀវភៅដែលត្រូវបានជ្រើសរើសនៅឡើយទេ
                    </TableCell>
                  </TableRow>
                ) : (
                  [...existingLoans, ...loanData].map((item, index) => (
                    <TableRow
                      key={item.barcode || index}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className='flex items-center justify-center'>
                        {item.image ? (
                          <img
                            src={
                              item.image.startsWith("http")
                                ? item.image
                                : `http://127.0.0.1:8000/storage/${item.image}`
                            }
                            alt={item.title}
                            className="h-10 w-8 object-cover rounded shadow-xs "
                          />
                        ) : (
                          <div className="h-10 w-8 bg-gray-200 flex items-center justify-center text-[8px] text-gray-500 rounded">
                            No Img
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-gray-800 dark:text-white line-clamp-1">
                          {item.title}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-gray-400 font-mono">
                          {item.barcode}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        {item.is_existing ? <span className="text-xs text-gray-500 italic">Borrowed</span> : <button onClick={() => handleDelete(item.barcode)} type="button" className="cursor-pointer inline-flex p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-all"><MdDelete className="h-5 w-5" /></button>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end w-full gap-2 pt-3">
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500/80 hover:bg-blue-600 cursor-pointer"
              } px-5 py-2 text-white font-medium rounded-xs transition-colors shadow-xs flex items-center gap-2`}
            >
              {loading ? "Processing..." : "Process Loans"}
            </button>

            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={loading}
              className="bg-red-500/80 hover:bg-red-600 px-5 py-2 text-white font-medium rounded-xs cursor-pointer transition-colors shadow-xs"
            >
              Clear All
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default LoansBook;





