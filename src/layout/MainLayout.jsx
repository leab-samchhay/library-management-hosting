import { NavLink, Outlet, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { AnimatePresence, motion } from "framer-motion";
import logo from '../assets/logolibrary.png';
import { Spinner } from '@/components/ui/spinner';
import { 
  IoMenuOutline, 
  IoCloseOutline, 
  IoChevronBackOutline, 
  IoChevronForwardOutline, 
  IoNotificationsOutline,
  IoSunnyOutline,
  IoMoonOutline
} from "react-icons/io5";
import { 
  FaUser, 
  FaHome, 
  FaBook, 
  FaCopy, 
  FaUsers, 
  FaBuilding, 
  FaFileInvoiceDollar, 
  FaRegCreditCard, 
  FaPenNib,
  FaSignOutAlt
} from "react-icons/fa";
import { 
  MdCategory, 
  MdAssignmentReturn, 
  MdLibraryBooks, 
  MdOutlineListAlt, 
  MdSwapHoriz, 
  MdOutlinePayment 
} from "react-icons/md";
import { GlobleContext } from "@/globleContext/GlobleContext";
import { Toaster } from "@/components/ui/toast";
import { logoutUser } from "@/service/auth";

const MainLayout = () => {
    const { token, user } = useSelector(state => state.auth);
    const [loading,setLoading] = useState(false);
    
    const navGroups = [
        {
            heading: "Main",
            items: [
                { name: "Dashboard", path: "/home", icon: <FaHome className="text-base" /> },
            ]
        },
        {
            heading: "Book Management",
            items: [
                { name: "Books", path: "/books", icon: <FaBook className="text-base" /> },
                { name: "Book Copies", path: "/bookcopy", icon: <FaCopy className="text-base" /> },
                { name: "Category", path: "/category", icon: <MdCategory className="text-base" /> },
                { name: "Authors", path: "/authors", icon: <FaPenNib className="text-base" /> },
                { name: "Publishers", path: "/publishers", icon: <FaBuilding className="text-base" /> },
                { name: "Author Books", path: "/authorBooks", icon: <MdLibraryBooks className="text-base" /> },
            ]
        },
        {
            heading: "Transaction",
            items: [
                { name: "Loans & Return", path: "/loansReturn", icon: <MdSwapHoriz className="text-base" /> },
                { name: "Loans", path: "/loans", icon: <MdLibraryBooks className="text-base" /> },
                { name: "Loans Detail", path: "/loansDetail", icon: <MdOutlineListAlt className="text-base" /> },
                { name: "Book Return", path: "/bookReturn", icon: <MdAssignmentReturn className="text-base" /> },
            ]
        },
        {
            heading: "People",
            items: [
                { name: "Users", path: "/user", icon: <FaUsers className="text-base" /> },
                { name: "Member", path: "/member", icon: <FaUsers className="text-base" /> },
            ]
        },
        {
            heading: "Fines",
            items: [
                { name: "Fines", path: "/fines", icon: <FaFileInvoiceDollar className="text-base" /> },
                { name: "Fine Payments", path: "/finesPayment", icon: <FaRegCreditCard className="text-base" /> },
            ]
        }
    ];

    const {isDarkMode,setIsDarkMode} = useContext(GlobleContext)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            setLoading(true);
            await logoutUser();
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(logout());
            navigate('/login');
            setLoading(false);
        }
    };

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const pageVariants = {
        hidden: { opacity: 0, y: 75},
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            transition: { duration: 1.5, ease: [0.25, 0.1, 0.25, 1.0] } 
        },
        exit: { opacity: 0, y: -8, transition: { duration: 0.25 } }
    };

    const [expandedGroups, setExpandedGroups] = useState({
        "Main": false,
        "Book Management": false,
        "Circulation": false,
        "People": false,
        "Finance": false
    });

    const toggleGroup = (heading) => {
        setExpandedGroups(prev => ({
            ...prev,
            [heading]: !prev[heading]
        }));
    };

    const NavItems = () => (
        <nav className="flex-1 pl-3 pr-2 py-4 space-y-2 overflow-y-auto pb-20 bg-black">
            {navGroups.map((group, idx) => {
                const isExpanded = expandedGroups[group.heading];
                
                return (
                    <div key={idx} className="flex flex-col gap-1 mb-4">
                        {/* Header (ចុចដើម្បីបើក/បិទ) */}
                        <button 
                            onClick={() => toggleGroup(group.heading)}
                            className="group flex w-full items-center cursor-pointer justify-between px-3 py-2  text-left transition-all duration-200 hover:bg-blue-700/40"
                        >
                            <span className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
                                isExpanded 
                                    ? "text-white/80 dark:text-indigo-400" 
                                    : "text-slate-500 dark:text-slate-400 group-hover:text-white dark:group-hover:text-slate-200"
                            }`}>
                                {group.heading}
                            </span>
                            
                            <span className={`transition-transform duration-300 ease-out ${
                                isExpanded 
                                    ? "rotate-90 text-white/80 dark:text-indigo-400" 
                                    : "text-slate-400 group-hover:text-white dark:group-hover:text-slate-300"
                            }`}>
                                <IoChevronForwardOutline size={14} />
                            </span>
                        </button>
                        
                        {/* Sub-menu (Animation បើក/បិទ យ៉ាងរលូន) */}
                        <div 
                            className={`grid transition-all duration-300 ease-in-out ${
                                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                            }`}
                        >
                            <div className="overflow-hidden">
                                {/* បន្ថែមបន្ទាត់បញ្ឈរ (Border Left) ដើម្បីឲ្យដឹងថាវាជា Sub-menu */}
                                <div className="mt-1 flex flex-col gap-1 pl-3 ml-4  border-slate-300 dark:border-white/10">
                                    {group.items.map((link) => (
                                        <NavLink
                                            key={link.path}
                                            to={link.path}
                                            end={link.path === "/"}
                                            className={({ isActive }) =>
                                                `group relative flex items-center gap-3 rounded-xs px-3 py-2 text-sm font-medium transition-all duration-200 ${
                                                    isActive
                                                        ? "bg-indigo-50 text-blue-800 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <div className={`flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                                                        isActive 
                                                            ? "text-indigo-600 dark:text-indigo-400" 
                                                            : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                                                    }`}>
                                                        {link.icon}
                                                    </div>
                                                    <span className="truncate">{link.name}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </nav>
    );

    return (
        <div className={`flex h-screen w-screen overflow-hidden font-sans antialiased ${isDarkMode ? "dark" : ""}`}>
            <div className="flex w-full h-full bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-zinc-100 transition-colors duration-300">
                
                {/* Desktop Sidebar */}
                <AnimatePresence initial={false}>
                    {isSidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 260, opacity: 1 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="hidden lg:flex flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-zinc-800/80 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-30 flex-shrink-0"
                        >
                            <div className="flex flex-col h-full w-full">
                                <div className="flex items-center gap-3 bg-[#0B2A81] px-6 border-b-1 border-slate-100 dark:border-zinc-800/60">
                                    
                                    <img src={logo} alt="logo"
                                        className="object-contain h-16 w-full"
                                    />
                                </div>
                                <NavItems />
                                
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Mobile / Tablet Drawer */}
                <AnimatePresence>
                    {isMobileOpen && (
                        <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            // exit={{ x: -280 }}
                            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
                            className="fixed top-0 left-0 bottom-0 w-[270px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-zinc-800/80 z-50 flex flex-col shadow-2xl lg:hidden"
                        >
                            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-zinc-800/60">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                        A
                                    </div>
                                    <span className="font-bold text-base tracking-tight text-slate-800 dark:text-white">AdminPro</span>
                                </div>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                    aria-label="Close menu"
                                >
                                    <IoCloseOutline size={22} />
                                </button>
                                
                            </div>
                            <NavItems />
                        </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content Layout */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                
                    {/* Top Header */}
                    <header className="h-16 px-4 md:px-8 flex justify-between items-center  dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/80 z-10 transition-colors duration-300">
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => setIsMobileOpen(true)}
                                className="p-2 text-slate-600  dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl lg:hidden transition-colors"
                                aria-label="Open sidebar"
                            >
                                <IoMenuOutline size={24} />
                            </button>

                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="hidden cursor-pointer lg:flex p-2 text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                aria-label="Toggle sidebar"
                            >
                                {isSidebarOpen ? <IoChevronBackOutline size={20} /> : <IoChevronForwardOutline size={20} />}
                            </button>
                        </div>

                        {/* Header Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 text-slate-500 hover:text-amber-500 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? <IoSunnyOutline size={20} className="text-amber-400" /> : <IoMoonOutline size={20} />}
                            </button>

                            <button 
                                className="relative p-2 text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                                aria-label="Notifications"
                            >
                                <IoNotificationsOutline size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-zinc-900" />
                            </button>

                            <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

                            <div className="flex items-center gap-3 pl-1 select-none cursor-pointer group">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {user?.name || "User"}
                                    </p>
                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500">{user?.email}</p>
                                </div>
                                <img
                                    src={user?.profile ? (user.profile.startsWith('http') ? user.profile : `http://127.0.0.1:8000/storage/${user.profile}`) : "https://ui-avatars.com/api/?name=User"}
                                    alt="User Avatar"
                                    className="rounded-xl w-8 h-8 md:w-9 md:h-9 object-cover ring-2 ring-slate-100 dark:ring-zinc-800 group-hover:ring-indigo-500 transition-all"
                                />
                                
                                <button 
                                    onClick={handleLogout}
                                    title="Logout"
                                    className="ml-2 p-2 text-rose-500 hover:bg-rose-100 cursor-pointer dark:hover:bg-rose-500/10 rounded-xl transition-all"
                                >
                                    <FaSignOutAlt size={18} />
                                    {loading && <Spinner />}
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Dynamic Content Viewport */}
                    <main className="flex-1 overflow-hidden p-4 md:p-6 lg:p-4 bg-[#f8fafc] dark:bg-[#090d16] transition-colors duration-300">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                variants={pageVariants}
                                initial="hidden"
                                animate="visible"
                                // exit="exit"
                                className="w-full h-full"
                            >
                                <div className="bg-white/70 p-5 overflow-y-auto dark:bg-zinc-900/70 backdrop-blur-md rounded-sm border-3 border-slate-200/70 dark:border-zinc-800/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]  h-full transition-colors duration-300">
                                    <Outlet />
                                </div>
                                <Toaster />
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;