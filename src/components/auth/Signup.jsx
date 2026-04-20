import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: ""
    });

    const [errors, setErrors] = useState({});

    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        // For phone number, only allow digits and limit to 10
        const value = e.target.name === "phoneNumber"
            ? e.target.value.replace(/\D/g, "").slice(0, 10)
            : e.target.value;
        setInput({ ...input, [e.target.name]: value });
        setErrors({ ...errors, [e.target.name]: "" });
    }

    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }

    // ── Frontend validation before API call ──
    const validate = () => {
        const newErrors = {};

        if (!input.fullname.trim()) {
            newErrors.fullName = "Full name is required.";
        } else if (input.fullname.trim().length > 20) {
            newErrors.fullName = "Full name cannot exceed 20 characters.";
        }

        if (!input.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!input.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required.";
        } else if (!/^[6-9]\d{9}$/.test(input.phoneNumber)) {
            newErrors.phoneNumber = "Enter a valid 10-digit phone number (starting with 6, 7, 8, or 9).";
        }

        if (!input.password.trim()) {
            newErrors.password = "Password is required.";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(input.password)) {
            newErrors.password = "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).";
        }

        if (!input.role) {
            newErrors.role = "Please select a role.";
        }

        return newErrors;
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        setErrors({});

        // Run frontend validation first
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const formData = new FormData();
        formData.append("fullName", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            const errData = error.response?.data;
            if (errData?.errors && Array.isArray(errData.errors)) {
                const fieldErrors = {};
                errData.errors.forEach(({ field, message }) => {
                    fieldErrors[field] = message;
                });
                setErrors(fieldErrors);
            } else {
                toast.error(errData?.message || "Something went wrong.");
            }
        } finally {
            dispatch(setLoading(false));
        }
    }

    useEffect(() => {
        if (user) navigate("/");
    }, [])

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Sign Up</h1>

                    {/* Full Name */}
                    <div className='my-2'>
                        <Label>Full Name</Label>
                        <Input
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            placeholder="Bob Smith"
                            className={errors.fullName ? "border-red-500" : ""}
                        />
                        {errors.fullName && <p className='text-red-500 text-xs mt-1'>{errors.fullName}</p>}
                    </div>

                    {/* Email */}
                    <div className='my-2'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="bob@gmail.com"
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
                    </div>

                    {/* Phone Number */}
                    <div className='my-2'>
                        <Label>Phone Number</Label>
                        <Input
                            type="text"
                            value={input.phoneNumber}
                            name="phoneNumber"
                            onChange={changeEventHandler}
                            placeholder="9876543210"
                            maxLength={10}
                            className={errors.phoneNumber ? "border-red-500" : ""}
                        />
                        {errors.phoneNumber && <p className='text-red-500 text-xs mt-1'>{errors.phoneNumber}</p>}
                    </div>

                    {/* Password */}
                    <div className='my-2'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="*******"
                            className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && <p className='text-red-500 text-xs mt-1'>{errors.password}</p>}
                    </div>

                    {/* Role + File */}
                    <div className='flex items-center justify-between'>
                        <div>
                            <RadioGroup className="flex items-center gap-4 my-5">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="radio"
                                        name="role"
                                        value="student"
                                        checked={input.role === 'student'}
                                        onChange={changeEventHandler}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="r1">Student</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="radio"
                                        name="role"
                                        value="recruiter"
                                        checked={input.role === 'recruiter'}
                                        onChange={changeEventHandler}
                                        className="cursor-pointer"
                                    />
                                    <Label htmlFor="r2">Recruiter</Label>
                                </div>
                            </RadioGroup>
                            {errors.role && <p className='text-red-500 text-xs mt-1'>{errors.role}</p>}
                        </div>

                        <div className='flex items-center gap-2'>
                            <Label>Profile</Label>
                            <Input
                                accept="image/*"
                                type="file"
                                onChange={changeFileHandler}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    {
                        loading
                            ? <Button className="w-full my-4"><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait</Button>
                            : <Button type="submit" className="w-full my-4">Signup</Button>
                    }
                    <span className='text-sm'>Already have an account? <Link to="/login" className='text-blue-600'>Login</Link></span>
                </form>
            </div>
        </div>
    )
}

export default Signup
