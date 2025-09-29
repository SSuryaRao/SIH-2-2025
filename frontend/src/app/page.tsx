'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Users,
  CreditCard,
  Building,
  BookOpen,
  Shield,
  Star,
  ChevronRight,
  CheckCircle,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const showHome = searchParams.get('home') === 'true';

      if (isAuthenticated && user && !showHome) {
        // Only redirect to dashboard if user isn't explicitly requesting home page
        const roleRoutes = {
          admin: '/dashboard/admin',
          staff: '/dashboard/staff',
          warden: '/dashboard/warden',
          student: '/dashboard/student',
        };
        router.push(roleRoutes[user.role] || '/dashboard');
      } else {
        setShowLanding(true);
      }
    }
  }, [isLoading, isAuthenticated, user, router, searchParams]);

  if (!showLanding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student profiles, admissions, and academic records management",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: CreditCard,
      title: "Fee Management",
      description: "Streamlined fee collection, payment tracking, and financial reporting",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Building,
      title: "Hostel Management",
      description: "Room allocation, occupancy tracking, and hostel administration",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BookOpen,
      title: "Exam Management",
      description: "Exam scheduling, registration, and result management system",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure access control for Admin, Staff, Warden, and Student roles",
      color: "from-red-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Reports",
      description: "Comprehensive reporting and analytics for data-driven decisions",
      color: "from-teal-500 to-teal-600"
    }
  ];

  const stats = [
    { label: "Active Students", value: "10,000+", icon: Users },
    { label: "Success Rate", value: "99.9%", icon: CheckCircle },
    { label: "Uptime", value: "24/7", icon: Clock },
    { label: "Security Rating", value: "A+", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden animate-gradient-xy">
      {/* Advanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main Morphing Shapes */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/30 to-purple-600/30 blur-3xl morphing-shape animate-gradient-x"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-600/30 blur-3xl morphing-shape animate-gradient-y animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 blur-3xl morphing-shape animate-gradient-xy animation-delay-2000"></div>

        {/* Floating Particles */}
        <div className="particle particle-1 top-20 left-20 w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"></div>
        <div className="particle particle-2 top-40 right-32 w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
        <div className="particle particle-3 top-60 left-1/3 w-4 h-4 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full"></div>
        <div className="particle particle-4 bottom-40 right-20 w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
        <div className="particle particle-1 top-32 right-1/4 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
        <div className="particle particle-2 bottom-60 left-1/4 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>

        {/* Additional Geometric Shapes */}
        <div className="absolute top-1/4 right-1/6 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-1/4 left-1/6 w-12 h-12 bg-gradient-to-br from-pink-400/20 to-rose-500/20 rounded-full animate-bounce animation-delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center space-x-4 group cursor-pointer relative">
              {/* Enhanced Logo Icon with Multiple Effects */}
              <div className="relative transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                {/* Main Icon Container with Glowing Background */}
                <div className="relative p-3 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/25 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-all duration-500">
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-xy"></div>

                  {/* Icon with Inner Glow */}
                  <GraduationCap className="h-8 w-8 text-white relative z-10 drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300" />

                  {/* Inner Shine Effect */}
                  <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Multiple Floating Particles */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-bounce opacity-80 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '0s', animationDuration: '2s'}}>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-ping"></div>
                </div>

                <div className="absolute -top-1 -left-2 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '0.5s'}}></div>

                <div className="absolute -bottom-2 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-bounce opacity-70 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '1s', animationDuration: '1.5s'}}></div>

                {/* Orbiting Rings */}
                <div className="absolute inset-0 border-2 border-indigo-300/30 rounded-2xl animate-spin opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDuration: '8s'}}></div>
                <div className="absolute inset-1 border border-purple-300/40 rounded-xl animate-spin opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{animationDuration: '6s', animationDirection: 'reverse'}}></div>
              </div>

              {/* Enhanced Text Logo */}
              <div className="relative overflow-hidden">
                <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:via-purple-600 group-hover:to-violet-600 transition-all duration-500 relative z-10">
                  OneCampus
                </span>

                {/* Animated Underline */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 group-hover:w-full transition-all duration-700 ease-out rounded-full"></div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-out"></div>

                {/* Floating Letters Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}>O</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-bounce" style={{animationDelay: '0.1s', animationDuration: '2s'}}>n</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-bounce" style={{animationDelay: '0.2s', animationDuration: '2s'}}>e</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-bounce" style={{animationDelay: '0.3s', animationDuration: '2s'}}>C</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-bounce" style={{animationDelay: '0.4s', animationDuration: '2s'}}>a</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-bounce" style={{animationDelay: '0.5s', animationDuration: '2s'}}>m</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-bounce" style={{animationDelay: '0.6s', animationDuration: '2s'}}>p</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-bounce" style={{animationDelay: '0.7s', animationDuration: '2s'}}>u</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent animate-bounce" style={{animationDelay: '0.8s', animationDuration: '2s'}}>s</span>
                </div>
              </div>

              {/* Background Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-violet-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="group relative overflow-hidden border-2 border-indigo-200 hover:border-indigo-400 bg-white/80 backdrop-blur-sm text-indigo-700 hover:text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                  <span className="relative z-10 flex items-center">
                    <svg className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Sign In
                  </span>
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 px-6 py-2.5 font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* Enhanced Badge with Neon Effect */}
            {/* <Badge className="mb-8 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-200 hover:to-purple-200 border-0 px-6 py-3 text-sm font-medium shadow-lg shadow-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-500 neon-blue">
              <Star className="w-4 h-4 mr-2 text-yellow-500 animate-spin" style={{animationDuration: '3s'}} />
              🏆 SIH 2025 Winning Solution
            </Badge> */}

            {/* Animated Hero Title */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl lg:text-9xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent block animate-gradient-x">
                  Revolutionizing
                </span>
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent block mt-4 animate-gradient-y">
                  Education Management
                </span>
              </h1>

              {/* Animated Typing Subtitle */}
              <div className="mt-6 h-12 flex items-center justify-center">
                <span className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent typing-animation">
                  The Future is Here ✨
                </span>
              </div>
            </div>

            {/* Enhanced Description */}
            <div className="mb-12 max-w-5xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light mb-4">
                Transform your educational institution with our
                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> comprehensive, AI-powered ERP system</span>.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed">
                🚀 Streamline operations • 📈 Enhance productivity • ✨ Create exceptional educational experiences
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Link href="/register">
                <Button size="lg" className="group bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-12 py-5 text-xl font-medium shadow-2xl shadow-indigo-500/25 hover:shadow-3xl hover:shadow-indigo-500/40 transition-all duration-500 transform hover:scale-110 neon-purple animate-gradient-x">
                  🚀 Start Free Trial
                  <ChevronRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
              {/* <Link href="/login">
                <Button size="lg" variant="outline" className="group px-12 py-5 text-xl font-medium border-2 border-gray-300 hover:border-indigo-400 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-500 transform hover:scale-110 glass-card">
                  🎬 Watch Demo
                  <svg className="ml-3 h-6 w-6 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                </Button>
              </Link> */}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 mb-16">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-500" />
                <span>Enterprise Security</span>
              </div>
              {/* <div className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                <span>SIH 2025 Innovation</span>
              </div> */}
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-purple-500" />
                <span>99.9% Uptime</span>
              </div>
            </div>

            {/* Hero Dashboard Preview */}
            <div className="relative max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/20 border border-white/40 p-8 relative overflow-hidden">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">OneCampus Dashboard</h3>
                      <p className="text-sm text-gray-600">Administrator Portal</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Student Management Card */}
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-5 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/20 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <Users className="w-8 h-8 text-blue-600 mb-3" />
                    <p className="text-sm font-medium text-blue-700 mb-1">Active Students</p>
                    <h4 className="text-2xl font-bold text-blue-800">2,547</h4>
                    <div className="flex items-center mt-2 text-xs text-blue-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>+12% this month</span>
                    </div>
                  </div>

                  {/* Fee Management Card */}
                  <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-5 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-400/20 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <CreditCard className="w-8 h-8 text-green-600 mb-3" />
                    <p className="text-sm font-medium text-green-700 mb-1">Revenue</p>
                    <h4 className="text-2xl font-bold text-green-800">₹24.5L</h4>
                    <div className="flex items-center mt-2 text-xs text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>+8% this month</span>
                    </div>
                  </div>

                  {/* Hostel Management Card */}
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-5 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-400/20 rounded-full transform translate-x-8 -translate-y-8"></div>
                    <Building className="w-8 h-8 text-purple-600 mb-3" />
                    <p className="text-sm font-medium text-purple-700 mb-1">Occupancy</p>
                    <h4 className="text-2xl font-bold text-purple-800">94%</h4>
                    <div className="flex items-center mt-2 text-xs text-purple-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span>1,205 students</span>
                    </div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">Monthly Analytics</h4>
                      <p className="text-sm text-gray-600">Student enrollment trends</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">+15.3%</span>
                    </div>
                  </div>

                  {/* Professional Chart Container */}
                  <div className="relative h-40 bg-white/60 rounded-lg p-4 border border-white/40">
                    {/* Y-axis grid lines and labels */}
                    <div className="absolute left-2 top-4 text-xs text-gray-500 font-medium">1000</div>
                    <div className="absolute left-2 top-1/3 text-xs text-gray-500 font-medium">750</div>
                    <div className="absolute left-2 top-2/3 text-xs text-gray-500 font-medium">500</div>
                    <div className="absolute left-2 bottom-8 text-xs text-gray-500 font-medium">250</div>

                    {/* Grid lines */}
                    <div className="absolute left-8 right-4 top-6 h-px bg-gray-200"></div>
                    <div className="absolute left-8 right-4 top-1/3 h-px bg-gray-200"></div>
                    <div className="absolute left-8 right-4 top-2/3 h-px bg-gray-200"></div>
                    <div className="absolute left-8 right-4 bottom-12 h-px bg-gray-200"></div>

                    {/* Chart bars container */}
                    <div className="flex items-end justify-center space-x-6 h-28 mt-2 ml-8 mr-4">
                      {/* January */}
                      <div className="flex flex-col items-center group">
                        <div className="relative">
                          <div className="w-8 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t shadow-lg group-hover:shadow-xl transition-all duration-300" style={{height: '65px'}}>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              624
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium mt-2">Jan</span>
                      </div>

                      {/* February */}
                      <div className="flex flex-col items-center group">
                        <div className="relative">
                          <div className="w-8 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t shadow-lg group-hover:shadow-xl transition-all duration-300" style={{height: '85px'}}>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              798
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium mt-2">Feb</span>
                      </div>

                      {/* March */}
                      <div className="flex flex-col items-center group">
                        <div className="relative">
                          <div className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t shadow-lg group-hover:shadow-xl transition-all duration-300" style={{height: '48px'}}>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              456
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium mt-2">Mar</span>
                      </div>

                      {/* April */}
                      <div className="flex flex-col items-center group">
                        <div className="relative">
                          <div className="w-8 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t shadow-lg group-hover:shadow-xl transition-all duration-300" style={{height: '95px'}}>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              892
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium mt-2">Apr</span>
                      </div>

                      {/* May */}
                      <div className="flex flex-col items-center group">
                        <div className="relative">
                          <div className="w-8 bg-gradient-to-t from-violet-500 to-violet-400 rounded-t shadow-lg group-hover:shadow-xl transition-all duration-300" style={{height: '75px'}}>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              723
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium mt-2">May</span>
                      </div>

                      {/* June */}
                      <div className="flex flex-col items-center group">
                        <div className="relative">
                          <div className="w-8 bg-gradient-to-t from-rose-500 to-rose-400 rounded-t shadow-lg group-hover:shadow-xl transition-all duration-300" style={{height: '88px'}}>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              834
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium mt-2">Jun</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Chart Legend */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded mr-2"></div>
                        <span className="text-gray-600 font-medium">New Admissions</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded mr-2"></div>
                        <span className="text-gray-600 font-medium">Peak Month</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Hover bars for details</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce animation-delay-1000">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Award className="w-4 h-4 text-white" />
                </div>

                {/* Animated Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5 rounded-3xl animate-pulse"></div>
              </div>

              {/* Additional Floating Cards */}
              <div className="absolute -left-8 top-1/4 bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/30 animate-float min-w-max">
                <Shield className="w-6 h-6 text-indigo-600 mb-2" />
                <h5 className="text-sm font-semibold text-gray-800">Secure Access</h5>
                <p className="text-xs text-gray-600">99.9% Uptime</p>
              </div>

              <div className="absolute -right-8 top-1/3 bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/30 animate-float animation-delay-1000 min-w-max">
                <BookOpen className="w-6 h-6 text-purple-600 mb-2" />
                <h5 className="text-sm font-semibold text-gray-800">Smart Learning</h5>
                <p className="text-xs text-gray-600">AI-Powered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join the growing community of educational institutions transforming their operations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="p-4 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-lg rounded-2xl shadow-lg shadow-black/5 border border-white/30 group-hover:shadow-xl group-hover:shadow-indigo-500/10 transition-all duration-300 group-hover:scale-110">
                      <stat.icon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-ping"></div>
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-0 px-4 py-2 text-sm font-medium">
              ✨ Advanced Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
              Powerful Features for
              <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Modern Education
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage your educational institution efficiently and effectively.
              Built with cutting-edge technology for the future of education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" style={{perspective: '1000px'}}>
            {features.map((feature, index) => (
              <Card key={index} className={`group card-3d hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-700 border-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl overflow-hidden relative glass-card animate-fade-in-up stagger-${index + 1}`}>
                {/* Animated Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Animated Top Border */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>

                {/* Floating Particles on Hover */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-ping"></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse"></div>

                <CardHeader className="relative z-10 p-8">
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-xl shadow-black/10 group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 animate-float neon-purple`} style={{animationDelay: `${index * 0.2}s`}}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-bounce flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-900 transition-colors duration-500 leading-tight">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <CardDescription className="text-gray-600 leading-relaxed text-base mb-6">
                    {feature.description}
                  </CardDescription>

                  {/* Enhanced Interactive Element */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-indigo-600 font-semibold text-sm hover:text-purple-600 transition-colors duration-300 cursor-pointer">
                        <span>Explore Feature</span>
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-500"></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse animation-delay-1000"></div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Animation */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-700">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                    </div>
                  </div>
                </CardContent>

                {/* Corner Accent */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-r from-indigo-900/5 via-purple-900/5 to-pink-900/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 border-0 px-4 py-2 text-sm font-medium">
              🎓 Student Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
              Loved by Educational
              <span className="block mt-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Institutions Nationwide
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied institutions who have transformed their operations with OneCampus
            </p>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative overflow-hidden rounded-3xl">
            <div className="flex animate-gradient-x" style={{animationDuration: '20s'}}>
              {/* Testimonial 1 */}
              <div className="min-w-full grid md:grid-cols-3 gap-8">
                <Card className="glass-card border-0 p-8 group hover:scale-105 transition-all duration-500">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      AD
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Dr. Anita Desai</h4>
                      <p className="text-gray-600 text-sm">Principal, Delhi University</p>
                      <div className="flex text-yellow-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">
                    "OneCampus has revolutionized our administration process. Student management has never been easier, and our efficiency has increased by 300%!"
                  </p>
                </Card>

                <Card className="glass-card border-0 p-8 group hover:scale-105 transition-all duration-500">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      RS
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Rajesh Sharma</h4>
                      <p className="text-gray-600 text-sm">Registrar, IIT Mumbai</p>
                      <div className="flex text-yellow-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">
                    "The AI-powered analytics feature gives us insights we never had before. Fee management is now completely streamlined!"
                  </p>
                </Card>

                <Card className="glass-card border-0 p-8 group hover:scale-105 transition-all duration-500">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      MK
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Prof. Maya Kumar</h4>
                      <p className="text-gray-600 text-sm">Dean, Anna University</p>
                      <div className="flex text-yellow-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">
                    "Outstanding support and features! Our hostel management has become so efficient that we've saved 40% on administrative costs."
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <p className="text-gray-600 font-medium">Universities</p>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                2M+
              </div>
              <p className="text-gray-600 font-medium">Students</p>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                99.9%
              </div>
              <p className="text-gray-600 font-medium">Uptime</p>
            </div>
            <div className="text-center group">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <p className="text-gray-600 font-medium">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 to-transparent"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>

            <CardContent className="p-16 text-center relative z-10">
              <div className="mb-8">
                <Badge className="bg-white/20 text-white border-0 px-4 py-2 text-sm font-medium">
                  🚀 Ready to Transform?
                </Badge>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Ready to Transform Your
                <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                  Educational Institution?
                </span>
              </h2>
              <p className="text-xl mb-10 text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                Join thousands of educational institutions already using OneCampus to streamline operations and enhance student experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-10 py-4 text-lg font-medium shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 transform hover:scale-105">
                    Get Started Today
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group relative overflow-hidden bg-white/90 backdrop-blur-sm text-indigo-600 hover:text-white border-2 border-white/50 hover:border-white font-semibold px-10 py-4 text-lg rounded-xl shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-white/20 transition-all duration-500 transform hover:scale-105"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-indigo-200/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></span>
                    <span className="relative z-10 flex items-center">
                      <svg className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Existing User? Sign In
                    </span>
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center space-x-8 text-sm text-indigo-200">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                  30-day free trial
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-300" />
                  Enterprise security
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-purple-300" />
                  24/7 support
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-0 px-4 py-2 text-sm font-medium">
              ❓ Frequently Asked Questions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-6">
              Got Questions?
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                We've Got Answers
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about OneCampus and how it can transform your institution
            </p>
          </div>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl transition-all duration-500">
              <details className="cursor-pointer">
                <summary className="p-6 list-none flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    How long does it take to implement EduFlow in our institution?
                  </h3>
                  <ChevronRight className="w-5 h-5 text-indigo-600 transition-transform duration-300 group-hover:rotate-90" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    Implementation typically takes 2-4 weeks depending on your institution size. Our dedicated onboarding team provides complete setup, data migration, and staff training to ensure a smooth transition.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-indigo-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Free setup and training included</span>
                  </div>
                </div>
              </details>
            </Card>

            {/* FAQ Item 2 */}
            <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl transition-all duration-500">
              <details className="cursor-pointer">
                <summary className="p-6 list-none flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    Is EduFlow suitable for both small colleges and large universities?
                  </h3>
                  <ChevronRight className="w-5 h-5 text-indigo-600 transition-transform duration-300 group-hover:rotate-90" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    Absolutely! OneCampus scales seamlessly from small institutions with 100 students to large universities with 50,000+ students. Our modular architecture ensures optimal performance regardless of size.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>100-50,000+ students</span>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span>Auto-scaling infrastructure</span>
                    </div>
                  </div>
                </div>
              </details>
            </Card>

            {/* FAQ Item 3 */}
            <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl transition-all duration-500">
              <details className="cursor-pointer">
                <summary className="p-6 list-none flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    What about data security and compliance?
                  </h3>
                  <ChevronRight className="w-5 h-5 text-indigo-600 transition-transform duration-300 group-hover:rotate-90" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    Security is our top priority. OneCampus features bank-grade encryption, SOC 2 compliance, GDPR compliance, and regular security audits. Your data is stored in secure Indian data centers.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <Shield className="w-4 h-4 mr-2" />
                      <span>SOC 2 Certified</span>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <Building className="w-4 h-4 mr-2" />
                      <span>Indian Data Centers</span>
                    </div>
                  </div>
                </div>
              </details>
            </Card>

            {/* FAQ Item 4 */}
            <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl transition-all duration-500">
              <details className="cursor-pointer">
                <summary className="p-6 list-none flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    Can EduFlow integrate with our existing systems?
                  </h3>
                  <ChevronRight className="w-5 h-5 text-indigo-600 transition-transform duration-300 group-hover:rotate-90" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    Yes! OneCampus offers comprehensive APIs and pre-built integrations with popular systems like Moodle, Google Workspace, Microsoft 365, and various payment gateways.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-indigo-600">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>100+ pre-built integrations available</span>
                  </div>
                </div>
              </details>
            </Card>

            {/* FAQ Item 5 */}
            <Card className="glass-card border-0 overflow-hidden group hover:shadow-xl transition-all duration-500">
              <details className="cursor-pointer">
                <summary className="p-6 list-none flex items-center justify-between group-hover:bg-indigo-50/50 transition-colors duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    What kind of support do you provide?
                  </h3>
                  <ChevronRight className="w-5 h-5 text-indigo-600 transition-transform duration-300 group-hover:rotate-90" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    We provide 24/7 technical support, dedicated customer success managers, comprehensive documentation, video tutorials, and live chat support in multiple languages.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-green-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>24/7 Support</span>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Dedicated Manager</span>
                    </div>
                    <div className="flex items-center text-purple-600">
                      <Award className="w-4 h-4 mr-2" />
                      <span>Premium Training</span>
                    </div>
                  </div>
                </div>
              </details>
            </Card>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">Still have questions? Our experts are here to help!</p>
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                Contact Our Team
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <GraduationCap className="h-8 w-8 text-indigo-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                  OneCampus
                </span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                Transforming education management with cutting-edge technology.
                Empowering institutions to focus on what matters most - student success.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors duration-200">Features</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors duration-200">Security</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors duration-200">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors duration-200">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors duration-200">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 OneCampus. All rights reserved. Built with ❤️ for education.
              </div>
              <div className="flex space-x-6 text-gray-400 text-sm">
                <a href="#" className="hover:text-indigo-400 transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="hover:text-indigo-400 transition-colors duration-200">Terms of Service</a>
                <a href="#" className="hover:text-indigo-400 transition-colors duration-200">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}
