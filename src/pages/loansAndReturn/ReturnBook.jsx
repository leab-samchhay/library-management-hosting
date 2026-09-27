import { GlobleContext } from "@/globleContext/GlobleContext";
import React, { useContext, useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { toast } from "@/components/ui/toast";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { useNavigate } from "react-router-dom";

const ReturnBook = () => {
  const { isDarkMode } = useContext(GlobleContext);
  const user = useSelector((state) => state.auth.user);
  const [member, setMember] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLateModal, setShowLateModal] = useState(false);
  const [booksToProcess, setBooksToProcess] = useState([]);
  const [fineAmount, setFineAmount] = useState(""); 
  const [fineType, setFineType] = useState("Late Return"); 
  const [maxDaysLate, setMaxDaysLate] = useState(0); 
  const navigate = useNavigate();

  const [form, setForm] = useState({
    member_id: "",
    due_date: user ? user.id : "", // Used as ReceivedBy
    loan_date: new Date().toISOString().split("T")[0], // Used as Return Date
    note: "",
  });

  useEffect(() => {
    if(user){
      setForm(prev => ({...prev, due_date: user.id}));
    }
  }, [user]);

  const getDataMember = async () => {
    try {
      const res = await api.get("members");
      setMember(res.data?.data?.data || res.data?.data || []);
    } catch (error) {
      console.error("Fetch members failed:", error);
      toast.error("មិនអាចទាញយកទិន្នន័យសមាជិក (Member) បានទេ!");
    }
  };

  useEffect(() => {
    getDataMember();
  }, []);

  const fetchActiveLoans = async (memberId) => {
    try {
      setLoading(true);
      const [loanDetailsRes, bookCopiesRes] = await Promise.all([
        api.get("loan-details?status=Borrowed&per_page=1000000"),
        api.get("book-copies?per_page=1000000")
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
          loan_id: ld.loan_id,
          book_copy_id: ld.book_copy_id,
          barcode: bc ? bc.barcode : ld.book_copy?.barcode,
          title: bc?.book ? bc.book.title : 'Unknown Title',
          image: bc?.book ? bc.book.image : '',
          returned_date: form.loan_date,
          status: 'Borrowed',
          book_condition: 'Good',
          fine_amount: '',
          bookCopy: bc || ld.book_copy,
          due_date: ld.loan?.due_date
        };
      });

      setLoanData(displayLoans);
    } catch (err) {
      console.error("Fetch active loans error:", err);
      toast.error("មានបញ្ហាក្នុងការទាញយកទិន្នន័យសៀវភៅដែលបានខ្ចី!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.member_id) {
      fetchActiveLoans(form.member_id);
    } else {
      setLoanData([]);
    }
  }, [form.member_id]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((pre) => ({ ...pre, [name]: value }));
  };

  const handleStatusChange = (id, newStatus) => {
    setLoanData(prev => 
      prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
    );
  };

  const handleConditionChange = (id, newCondition) => {
    setLoanData(prev => 
      prev.map(item => item.id === id ? { ...item, book_condition: newCondition } : item)
    );
  };

  const handleFineChange = (id, amount) => {
    setLoanData(prev => 
      prev.map(item => item.id === id ? { ...item, fine_amount: amount } : item)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const returnedBooks = loanData.filter(b => b.status === "Returned");
    if (returnedBooks.length === 0) {
      alert("សូមជ្រើសរើសសៀវភៅដែលត្រូវសង (សូមប្តូរ Status ទៅជា Returned)!");
      return;
    }

    if (!user?.id) { alert("Session expired or missing Staff ID! Please Logout and Login again."); return; }

    let maxLate = 0;
    const lateBooks = returnedBooks.filter(b => {
      const returnDateStr = b.return_date || form.loan_date;
      if (!returnDateStr || !b.due_date) return false;
      const returnDate = new Date(returnDateStr);
      const dueDate = new Date(b.due_date);
      if (returnDate > dueDate) {
        const diffTime = Math.abs(returnDate - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > maxLate) maxLate = diffDays;
        return true;
      }
      return false;
    });

    if (lateBooks.length > 0) {
      setBooksToProcess(returnedBooks);
      setMaxDaysLate(maxLate);
      setShowLateModal(true);
      setFineAmount(""); 
      setFineType("Late Return"); 
      return;
    }

    processSubmit(returnedBooks);
  };

  const processSubmit = async (returnedBooks) => {
    try {
      setLoading(true);

            for (const item of returnedBooks) {
        let finalFineAmount = fineAmount !== "" ? parseFloat(fineAmount) : 0;
        let finalFineType = fineType;
        
        if (item.book_condition !== "Good" && item.fine_amount !== "") {
            const conditionFine = parseFloat(item.fine_amount);
            if (finalFineAmount > 0) {
                finalFineAmount += conditionFine;
                finalFineType = fineType + " & " + item.book_condition;
            } else {
                finalFineAmount = conditionFine;
                finalFineType = item.book_condition;
            }
        }

        const returnDateStr = item.return_date || form.loan_date;
        const returnDate = new Date(returnDateStr);
        const dueDate = new Date(item.due_date);
        
        let autoNote = "Return regularly";
        if (returnDate > dueDate) {
          autoNote = "Late Return";
        }
        const finalNote = form.note ? `${autoNote} - ${form.note}` : autoNote;

        // 1. Insert into book-returns
        await api.post("book-returns", {
          loan_detail_id: item.id,
          returned_date: returnDateStr,
          received_by: String(user.id),
          note: finalNote,
          fine_amount: finalFineAmount,
          fine_type: finalFineType,
          book_condition: item.book_condition
        });

        // The loan-details and book-copies statuses are now handled automatically by the backend BookReturnController
      }
      
      // 4. Update parent loan status based on remaining borrowed books
      const loanIdsToUpdate = [...new Set(returnedBooks.map(b => b.loan_id))];
      for (const loanId of loanIdsToUpdate) {
        const hasPending = loanData.some(b => b.loan_id === loanId && b.status !== "Returned");
        const finalStatus = hasPending ? "1" : "0";
        try {
          const loanRes = await api.get("loans/" + loanId);
          const loanDataDb = loanRes.data?.data;
          if (loanDataDb) {
            await api.put("loans/" + loanId, {
              member_id: loanDataDb.member_id,
              staff_id: loanDataDb.staff_id || "",
              loan_date: loanDataDb.loan_date,
              due_date: loanDataDb.due_date,
              note: loanDataDb.note || "",
              status: finalStatus
            });
          }
        } catch (e) {
          console.error("Failed to update parent loan status for loanId " + loanId + ":", e);
        }
      }

      


      const ids = toast.add({
        description: "success",
        actionProps: {
          children: "Close",
          onClick() {
            toast.close(ids);
          },
        },
        timeout: 3000,
      });
      
      // Refresh the list
      setLoanData([]);
      
      // Dispatch event to refresh Layout.jsx
      window.dispatchEvent(new Event("loanSubmitSuccess"));
      
      // Reset form fields
      setForm({
        member_id: "",
        due_date: "", // Used as ReceivedBy
        loan_date: new Date().toISOString().split("T")[0], // Used as Return Date
        note: "",
      });

    } catch (error) {
      console.error("Submit error:", error);
      let msg = "មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ!\n";
      if (error.response?.data?.errors) {
        msg += JSON.stringify(error.response.data.errors, null, 2);
      } else if (error.response?.data?.message) {
        msg += error.response.data.message;
      } else {
        msg += error.message;
      }
      alert(msg);
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
        <div className="text-white font-medium">Information BookReturn</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <Field>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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

              <div>
                <FieldLabel htmlFor="due_date" className={isDarkMode ? 'text-white/80' : ''}>ReceivedBy (Staff Name)</FieldLabel>
                <Input
                  id="due_date"
                  type="text"
                  name="due_date"
                  value={user ? user.name : ""}
                  readOnly
                  className={`rounded-sm mb-4 py-4 cursor-not-allowed opacity-70 ${isDarkMode ? 'bg-black/40 border-gray-600 text-white' : 'bg-gray-100'}`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <FieldLabel htmlFor="loan_date" className={isDarkMode ? 'text-white/80' : ''}>Return Date</FieldLabel>
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
          Book Return
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
                  <TableHead className="text-white w-20">Photo</TableHead>
                  <TableHead className="text-white">Book Title</TableHead>
                  <TableHead className="text-white">Barcode</TableHead>
                  <TableHead className="text-white text-center">Status</TableHead>
                  <TableHead className="text-white text-center">Condition</TableHead>
                  <TableHead className="text-white text-center">Fine</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loanData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-gray-400"
                    >
                      មិនទាន់មានសៀវភៅដែលត្រូវធ្វើការសងនៅឡើយទេ
                    </TableCell>
                  </TableRow>
                ) : (
                  loanData.map((item, index) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        {item.image ? (
                          <img
                            src={
                              item.image.startsWith("http")
                                ? item.image
                                : `http://127.0.0.1:8000/storage/${item.image}`
                            }
                            alt={item.title}
                            className="h-10 w-8 object-cover rounded shadow-xs"
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

                      
                      <TableCell >
                        <Select
                          value={item.status}
                          onValueChange={(val) => handleStatusChange(item.id, val)}
                        >
                          <SelectTrigger className=" h-8 text-xs w-full ">
                            <SelectValue placeholder="Status">
                              {item.status || "Status"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Borrowed">Borrowed</SelectItem>
                            <SelectItem value="Returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        {item.status === "Returned" ? (
                          <Select
                            value={item.book_condition}
                            onValueChange={(val) => handleConditionChange(item.id, val)}
                          >
                            <SelectTrigger className=" h-8 text-xs w-full ">
                              <SelectValue placeholder="Condition">
                                {item.book_condition || "Condition"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Good">Good (ធម្មតា)</SelectItem>
                              <SelectItem value="Damaged">Damaged (ខូចខាត)</SelectItem>
                              <SelectItem value="Lost">Lost (បាត់)</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {item.status === "Returned" && item.book_condition !== "Good" ? (
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.fine_amount}
                            onChange={(e) => handleFineChange(item.id, e.target.value)}
                            placeholder="Fine ($)"
                            className="h-8 w-24 text-xs"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end w-full gap-2 pt-3">
            <button
              type="submit"
              disabled={loading || loanData.length === 0}
              className={`${
                loading || loanData.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500/80 hover:bg-blue-600 cursor-pointer"
              } px-5 py-2 text-white font-medium rounded-xs transition-colors shadow-xs flex items-center gap-2`}
            >
              {loading ? "Processing..." : "Process Return Books"}
            </button>
          </div>
        </div>
      </form>

      {/* Late Return Modal */}
      {showLateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-6 rounded-lg shadow-xl max-w-md w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          >
            <h3 className="text-xl font-bold text-red-500 mb-4">សៀវភៅហួសកាលកំណត់! (Late Return)</h3>
            <p className="mb-4 text-red-600 font-semibold">
              សៀវភៅដែលត្រូវសងនេះហួសកាលកំណត់ចំនួន {maxDaysLate} ថ្ងៃ។
            </p>
            <p className="mb-4">
              សូមបញ្ចូលចំនួនប្រាក់ពិន័យ (ប្រសិនបើមាន)។
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">ប្រភេទការពិន័យ (Fine Type):</label>
              <input 
                type="text"
                value={fineType}
                onChange={(e) => setFineType(e.target.value)}
                placeholder="Late Return"
                className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'} outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">ចំនួនទឹកប្រាក់ពិន័យ (Fine Amount - USD):</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                value={fineAmount}
                onChange={(e) => setFineAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-black'} outline-none focus:ring-2 focus:ring-red-500`}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLateModal(false);
                  processSubmit(booksToProcess);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition shadow-sm cursor-pointer"
              >
                Proceed
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ReturnBook;






