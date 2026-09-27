import React, { useState, useEffect } from 'react';
import ReactApexChart from "react-apexcharts";
import { ImLibrary } from "react-icons/im";
import { FaUserLock, FaUsers, FaBook } from "react-icons/fa";
import { FaBookOpenReader } from "react-icons/fa6";
import { BiSolidCategory } from "react-icons/bi";
import { GrBackTen } from "react-icons/gr";
import { MdCreditScore, MdEditDocument, MdDelete } from "react-icons/md";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import api from '@/service/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const HomePage = () => {
    const [loansData, setLoansData] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [summary, setSummary] = useState({
        total_users: 0,
        total_members: 0,
        total_books: 0,
        total_spent: "0.00",
        books_info: { good_condition: 0, damaged: 0, lost: 0 },
        loan_info: { books_borrowed: 0, active_borrowers: 0 },
        return_info: { books_returned: 0, members_returned: 0 }
    });
    
    const [pagination, setPagination] = useState({
        currentPage : 1,
        lastPage: 1,
        from: 0,
        to: 0,
        total: 0
    });

    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDark = () => document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
        setIsDarkMode(checkDark());
        
        const observer = new MutationObserver(() => setIsDarkMode(checkDark()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => {
            getData(1, perPage, search);
        }, 500);
        return () => clearTimeout(delay);
    }, [perPage, search]);

    const getData = async(page = pagination.currentPage, limit = perPage, searchTerm = search) => {
        try {
            setLoading(true);
            let queryParams = `loan-details?page=${page}&per_page=${limit}`;
            
            if (searchTerm) {
                const term = searchTerm.toLowerCase().trim();
                if (term === 'borrowed' || term === 'returned') {
                    queryParams += `&status=${searchTerm}`;
                } else if (!isNaN(term) && term !== '') {
                    queryParams += `&loan_id=${term}`;
                } else {
                    queryParams += `&status=${searchTerm}`;
                }
            }

            const res = await api.get(queryParams);
            const result = res.data.data;
            
            setLoansData(result.data || []);
            setPagination({
                currentPage: result.current_page,
                lastPage: result.last_page,
                from: result.from,
                to: result.to,
                total: result.total
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = window.confirm("Do you want to delete this record?");
        if (confirm) {
            try {
                setLoading(true);
                await api.delete(`loan-details/${id}`);
                getData();
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    
    const [state, setState] = React.useState({
        series: [
            {
                data: [
                    {
                        x: 'ប្រលោមលោក', // ឈ្មោះប្រភេទសៀវភៅ (Category)
                        y: 75, // ចំនួនសរុបប្រចាំប្រភេទ
                        children: [
                            { x: 'រឿង ផ្កាស្រពោន', y: 35 }, // ឈ្មោះសៀវភៅ និងចំនួនដែលគេខ្ចី
                            { x: 'រឿង ថៅកែចិត្តចោរ', y: 25 },
                            { x: 'រឿង គូលីកំណែន', y: 15 },
                        ],
                    },
                    {
                        x: 'បច្ចេកវិទ្យា',
                        y: 70,
                        children: [
                            { x: 'JavaScript ជំហានដំបូង', y: 40 },
                            { x: 'រៀន ReactJS', y: 30 },
                        ],
                    },
                    {
                        x: 'ប្រវត្តិសាស្ត្រ',
                        y: 30,
                        children: [
                            { x: 'ប្រវត្តិសាស្ត្រខ្មែរ', y: 20 },
                            { x: 'សង្គ្រាមលោកលើកទី២', y: 10 },
                        ],
                    },
                    {
                        x: 'ទស្សនវិជ្ជា',
                        y: 15,
                        children: [
                            { x: 'សិល្បៈនៃការរស់នៅ', y: 10 },
                            { x: 'ផ្នត់គំនិតអ្នកជោគជ័យ', y: 5 },
                        ],
                    },
                ],
            },
        ],
        
        options: {
            chart: {
                type: 'sunburst',
                height: 480,
                fontFamily: '"Khmer OS Battambang", sans-serif',
            },
            colors: ['#0EA5E9', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6'], // ពណ៌តំណាងឲ្យប្រភេទនីមួយៗ
            legend: {
                position: 'bottom',
            },
            title: {
                text: 'ចំនួនដងនៃការខ្ចីសៀវភៅនីមួយៗ​ ( Borrowing Count by Book )', // ចំណងជើងក្រាប
                align: 'left',
                style: {
                    fontFamily: '"Khmer OS Battambang", sans-serif', // សម្រាប់ចំណងជើង
                    fontWeight: 'normal',
                    fontSize: 15
                }
            },
            plotOptions: {
                sunburst: {
                    innerSize: '20%', // ទំហំរង្វង់កណ្តាល
                    borderRadius: 0,
                    spacing: 1,
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val;
                    }
                }
            },
            stroke: {
                width: 1,
                colors: ['#fff'],
            },
        },
    });


    const [stateChat, setStateChat] = React.useState({
        series: [
            {
                name: 'ចំនួនអ្នកខ្ចី (Borrowers)',
                data: [], 
            },
        ],
        options: {
            chart: {
                type: 'area',
                height: 350,
                zoom: { enabled: false },
                fontFamily: '"Khmer OS Battambang", sans-serif',
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth' },
            title: {
                text: 'ចំនួនអ្នកខ្ចីសៀវភៅប្រចាំខែ ( Number of Borrowers per Month )',
                align: 'left',
                style: {
                    fontWeight: 'normal', 
                    fontSize: '15px',
                }
            },
            xaxis: {
                type: 'category',
                categories: [], // ទុកទទេសិន (Empty Array)
            },
        }
    });

    // count member loant book
    const fetchMonthlyReport = async () => {
        try {
            const response = await api.get('report/monthly-borrower'); 
            const records = response.data.data;

            // ញែកទិន្នន័យជា ២ ផ្នែក សម្រាប់បោះចូលក្រាប
            const labels = records.map(item => item.label); // យកឈ្មោះខែ
            const borrowersCount = records.map(item => item.total_member_borrowers); // យកចំនួនអ្នកខ្ចី

            // អាប់ដេត State របស់ Chart ដើម្បីបង្ហាញទិន្នន័យថ្មី
            setStateChat(prevState => ({
                ...prevState,
                series: [
                    {
                        name: 'ចំនួនអ្នកខ្ចី (Borrowers)',
                        data: borrowersCount // បញ្ចូលចំនួនលេខចូលទីនេះ
                    }
                ],
                options: {
                    ...prevState.options,
                    xaxis: {
                        ...prevState.options.xaxis,
                        categories: labels // បញ្ចូលឈ្មោះខែចូលទីនេះ
                    }
                }
            }));

        } catch (error) {
            console.error("មានបញ្ហាក្នុងការទាញទិន្នន័យរបាយការណ៍:", error);
        }
    };

    const fetchSummaryData = async () => {
        try {
            const response = await api.get('report/getSummary'); 
            
            if (response.data && response.data.data) {
                setSummary(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching summary data:", error);
        }
    };

    const fetchSunburstData = async () => {
        try {
            const response = await api.get('report/borrow-by-category');
            if (response.data && response.data.data) {
                setState(prevState => ({
                    ...prevState,
                    series: [
                        {
                            data: response.data.data
                        }
                    ]
                }));
            }
        } catch (error) {
            console.error("Error fetching sunburst data:", error);
        }
    };

    useEffect(()=>{
        fetchMonthlyReport();
        fetchSummaryData();
        fetchSunburstData();
    },[])

    useEffect(() => {
        // Remove hardcoded percentage text from Sunburst tooltip
        const removeTooltipPercentage = () => {
            const tooltips = document.querySelectorAll('.apexcharts-tooltip-text-y-value');
            tooltips.forEach(tooltip => {
                if (tooltip.innerText && tooltip.innerText.includes('% of parent')) {
                    tooltip.innerText = tooltip.innerText.split(' (')[0];
                }
            });
        };

        const tooltipObserver = new MutationObserver(() => {
            removeTooltipPercentage();
        });

        tooltipObserver.observe(document.body, { childList: true, subtree: true, characterData: true });

        return () => tooltipObserver.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-6 transition-colors duration-200">

            {/* Header */}
            <div className=" flex items-center text-2xl font-bold border-b-2 pb-4 border-gray-200 dark:border-slate-700 mx-3 mb-6 text-gray-800 dark:text-slate-100 gap-4">
                <h1 className='mb-1'><ImLibrary /></h1> 
                <h1>Library Management System Report</h1>
            </div>

            {/* Top Section: Summary Stats (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mx-3 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-indigo-500 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
                            <h3 className="text-xl font-extrabold text-gray-800 dark:text-slate-100">{summary.total_users}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-2xl">
                            <h1><FaUserLock /></h1>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-emerald-500 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Member</p>
                            <h3 className="text-xl font-extrabold text-gray-800 dark:text-slate-100">{summary.total_members}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-2xl">
                            <h1><FaUsers /></h1>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-blue-500 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Books</p>
                            <h3 className="text-xl font-extrabold text-gray-800 dark:text-slate-100">{summary.total_books}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-2xl">
                            <h1><FaBookOpenReader /></h1>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-emerald-500 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Spent on Books</p>
                            <h3 className="text-xl font-extrabold text-gray-800 dark:text-slate-100">$ {summary.total_spent}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-4xl">
                            <RiMoneyDollarCircleFill />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Detailed Information (3 Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-3">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-blue-500 p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                        <div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center gap-2">
                                <FaBook /> Books Info
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Good Condition</span>
                                    <span className="text-green-700 dark:text-green-400 font-bold bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full text-sm">{summary?.books_info?.good_condition || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Damaged</span>
                                    <span className="text-orange-700 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-500/10 px-3 py-1 rounded-full text-sm">{summary?.books_info?.damaged || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Lost</span>
                                    <span className="text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full text-sm">{summary?.books_info?.lost || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-amber-500 p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                        <div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center gap-2">
                                <span className='text-xl'><GrBackTen /></span> Loan Info
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium"> Books Ever Borrowed</span>
                                    <span className="text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full text-sm">{summary?.loan_info?.books_borrowed || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Books Currently on Loan</span>
                                    <span className="text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full text-sm">{summary?.loan_info?.active_borrowers || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-emerald-500 p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                        <div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center gap-2">
                                <span className='text-2xl'><MdCreditScore /></span> Return Info
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Books Returned</span>
                                    <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full text-sm">{summary?.return_info?.books_returned || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Members Returned</span>
                                    <span className="text-teal-700 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-500/10 px-3 py-1 rounded-full text-sm">{summary?.return_info?.members_returned || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-3 mt-6">
                
                {/* Area Chart Container */}
                <div id="chart-area" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 flex items-center justify-center">
                    <div className="w-full">
                        <ReactApexChart
                            options={{
                                ...stateChat.options,
                                theme: { mode: isDarkMode ? 'dark' : 'light' },
                                chart: { ...stateChat.options.chart, background: 'transparent' }
                            }}
                            series={stateChat.series}
                            type="area"
                            height={450}
                        />
                    </div>
                </div>

                {/* Sunburst Chart Container */}
                <div id="chart-sunburst" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 px-4 py-9 flex items-center justify-center">
                    <div className="w-full">
                        <ReactApexChart
                            options={{
                                ...state.options,
                                theme: { mode: isDarkMode ? 'dark' : 'light' },
                                chart: { ...state.options.chart, background: 'transparent' }
                            }}
                            series={state.series}
                            type="sunburst"
                            height={450}
                        />
                    </div>
                </div>

            </div>

            
        </div>
    );
};

export default HomePage;