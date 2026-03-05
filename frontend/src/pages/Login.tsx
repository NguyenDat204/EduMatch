import { Mail, Lock, Chrome, Facebook } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { motion } from "framer-motion";

export function Login() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Image/Promotion */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-slate-50 p-12 relative overflow-hidden">
                <div className="absolute top-8 left-8">
                    <a href="/" className="flex items-center gap-2 text-primary font-bold">
                        <div className="bg-primary text-white p-1 rounded-lg">
                            <span className="material-symbols-outlined block text-sm">school</span>
                        </div>
                        EduMatch
                    </a>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md text-center"
                >
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkvc7L_m3TycX89AwgDNjufBaSSgrnUTR2b62-LM7Ohstz9wPYB51A2n36IvIiR5E1FIHFHgsTzcgHa9ZdTKrypSOPsDHWkKoRmYyNUZGVQgnyaYrV-ucCaNqkZdL1vaMYADwMYdtJtrK362GkEqUf20FSQsjPvC3nHjRYVNlAa69OvgFzCo_AInhV5sffbFmxQ1MyOkhAdq-Fljl7trRpJgY0W7WnN1i10_M1tTtdNf8C2JuMttbf0_T4V2why96A0FsAJlG1fNMg"
                        alt="Welcome back"
                        className="rounded-[2.5rem] shadow-2xl mb-12 rotate-2"
                    />
                    <h2 className="text-4xl font-black mb-6 leading-tight">Chào mừng trở lại với <span className="text-primary">EduMatch!</span></h2>
                    <p className="text-slate-600 text-lg">Hãy tiếp tục hành trình chọn trường của bạn và kiến tạo tương lai vững chắc ngay hôm nay.</p>
                </motion.div>

                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex flex-col justify-center px-6 lg:px-24 xl:px-32 py-12 bg-white">
                <div className="max-w-md w-full mx-auto">
                    <div className="lg:hidden mb-8">
                        <a href="/" className="flex items-center gap-2 text-primary font-bold">
                            <div className="bg-primary text-white p-1 rounded-lg">
                                <span className="material-symbols-outlined block text-sm">school</span>
                            </div>
                            EduMatch
                        </a>
                    </div>

                    <h1 className="text-3xl font-black mb-2">Đăng nhập</h1>
                    <p className="text-slate-500 mb-8">Vui lòng nhập thông tin của bạn để tiếp tục.</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <Button variant="secondary" className="gap-2 font-medium py-6">
                            <Chrome className="w-5 h-5 text-red-500" />
                            Tiếp tục với Google
                        </Button>
                        <Button variant="secondary" className="gap-2 font-medium py-6">
                            <Facebook className="w-5 h-5 text-blue-600" />
                            Tiếp tục với Facebook
                        </Button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-slate-500 font-medium tracking-wider">Hoặc email</span>
                        </div>
                    </div>

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Địa chỉ Email</label>
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                icon={<Mail className="w-5 h-5" />}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700 ml-1">Mật khẩu</label>
                                <a href="#" className="text-xs font-bold text-primary hover:underline">Quên mật khẩu?</a>
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                            />
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input type="checkbox" id="remember" className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" />
                            <label htmlFor="remember" className="text-sm font-medium text-slate-600">Duy trì đăng nhập</label>
                        </div>

                        <Button className="w-full py-7 text-lg shadow-xl shadow-primary/20">
                            Đăng nhập ngay
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-slate-600">
                        Chưa có tài khoản? <a href="/register" className="text-primary font-bold hover:underline">Đăng ký miễn phí</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
