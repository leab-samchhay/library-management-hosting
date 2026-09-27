import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@/service/auth';
import { loginSuccess } from '@/store/authSlice';
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from '@base-ui/react/button';
import { Spinner } from '@/components/ui/spinner';
import { toast, Toaster } from "@/components/ui/toast";
import { GlobleContext } from '@/globleContext/GlobleContext';

const Login = () => {
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('12345678');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token } = useSelector(state => state.auth);
    const { isDarkMode } = useContext(GlobleContext);

    useEffect(() => {
        if (token) {
            navigate('/');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        try {
            const data = await loginUser(cleanEmail, cleanPassword);
            dispatch(loginSuccess(data));
            
            if (toast && toast.add) {
                toast.add({
                    type: "success",
                    description: "Login successfully!",
                    timeout: 3000,
                });
            }
            
            navigate('/'); // redirect to dashboard or home
        } catch (error) {
            console.error(error);
            if (toast && toast.add) {
                toast.add({
                    type: "error",
                    description: error.response?.data?.message || error.message || "Login failed. Please check your credentials.",
                    timeout: 3000,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            <div className={`w-full max-w-md p-8 space-y-8 rounded-lg shadow-lg border-2 ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200"}`}>
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-blue-500">Welcome Back</h2>
                    <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Please sign in to your account
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Field>
                            <FieldLabel htmlFor="email">Email address</FieldLabel>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className={`w-full p-3 rounded-md border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className={`w-full p-3 rounded-md border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </Field>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                    >
                        {loading ? <span className="flex items-center gap-2"><Spinner /> Signing in...</span> : 'Sign in'}
                    </Button>
                </form>
            </div>
            <Toaster />
        </div>
    );
};

export default Login;