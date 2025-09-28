'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';

// Validation schema for admission form
const admissionSchema = z.object({
  personalInfo: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other'], { message: 'Please select gender' }),
    bloodGroup: z.string().optional(),
    category: z.enum(['General', 'OBC', 'SC', 'ST', 'EWS'], { message: 'Please select category' }),
    nationality: z.string().min(2, 'Nationality is required'),
    religion: z.string().optional(),
    address: z.object({
      permanent: z.object({
        street: z.string().min(5, 'Street address must be at least 5 characters'),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
        country: z.string().default('India')
      }),
      correspondence: z.object({
        street: z.string().min(5, 'Street address must be at least 5 characters'),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
        country: z.string().default('India'),
        sameAsPermanent: z.boolean()
      })
    })
  }),
  parentInfo: z.object({
    father: z.object({
      name: z.string().min(2, 'Father&apos;s name is required'),
      occupation: z.string().min(2, 'Father&apos;s occupation is required'),
      income: z.number().min(0, 'Income must be a positive number'),
      phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid phone number').optional(),
      email: z.string().email().optional().or(z.literal(''))
    }),
    mother: z.object({
      name: z.string().min(2, 'Mother&apos;s name is required'),
      occupation: z.string().min(2, 'Mother&apos;s occupation is required'),
      income: z.number().min(0, 'Income must be a positive number'),
      phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid phone number').optional(),
      email: z.string().email().optional().or(z.literal(''))
    })
  }),
  academicInfo: z.object({
    appliedCourse: z.string().min(1, 'Please select a course'),
    appliedBranch: z.string().min(1, 'Please select a branch'),
    previousEducation: z.array(z.object({
      level: z.enum(['10th', '12th', 'Diploma', 'Bachelor']),
      board: z.string().min(2, 'Board is required'),
      school: z.string().min(2, 'School/Institution name is required'),
      year: z.number().min(1990).max(new Date().getFullYear()),
      percentage: z.number().min(0).max(100),
      subjects: z.array(z.string()).optional()
    })).min(1, 'At least one educational qualification is required'),
    entranceExam: z.object({
      name: z.string(),
      rollNumber: z.string(),
      rank: z.number().int().min(1),
      score: z.number().min(0),
      year: z.number().int().min(2020).max(new Date().getFullYear())
    }).optional()
  }),
  feeInfo: z.object({
    admissionFee: z.number().min(0),
    processingFee: z.number().min(0),
    totalFee: z.number().min(0)
  })
});

type AdmissionFormData = z.infer<typeof admissionSchema>;

export default function AdmissionApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coursesAndBranches, setCoursesAndBranches] = useState<Record<string, string[]>>({});

  const form = useForm<AdmissionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(admissionSchema) as any,
    defaultValues: {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'male' as const,
        bloodGroup: '',
        category: 'General' as const,
        nationality: 'India',
        religion: '',
        address: {
          permanent: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          correspondence: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            sameAsPermanent: false
          }
        }
      },
      parentInfo: {
        father: {
          name: '',
          occupation: '',
          income: 0,
          phone: '',
          email: ''
        },
        mother: {
          name: '',
          occupation: '',
          income: 0,
          phone: '',
          email: ''
        }
      },
      academicInfo: {
        appliedCourse: '',
        appliedBranch: '',
        previousEducation: [{
          level: '12th',
          board: '',
          school: '',
          year: new Date().getFullYear(),
          percentage: 0
        }],
        entranceExam: {
          name: '',
          rollNumber: '',
          rank: 1,
          score: 0,
          year: new Date().getFullYear()
        }
      },
      feeInfo: {
        admissionFee: 10000,
        processingFee: 1000,
        totalFee: 11000
      }
    }
  });

  const watchSameAddress = form.watch('personalInfo.address.correspondence.sameAsPermanent');
  const watchAppliedCourse = form.watch('academicInfo.appliedCourse');

  // Copy permanent address to correspondence address
  useEffect(() => {
    if (watchSameAddress) {
      const permanentAddress = form.getValues('personalInfo.address.permanent');
      form.setValue('personalInfo.address.correspondence', {
        ...permanentAddress,
        sameAsPermanent: true
      });
    }
  }, [watchSameAddress, form]);

  // Load courses and branches
  useEffect(() => {
    const fetchCoursesAndBranches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admissions/courses-branches');
        if (response.data.success) {
          setCoursesAndBranches(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching courses and branches:', error);
        toast.error('Failed to load courses and branches');
      }
    };

    fetchCoursesAndBranches();
  }, []);

  const onSubmit = async (data: AdmissionFormData) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/admissions/submit', data);

      if (response.data.success) {
        toast.success(`Application submitted successfully! Application Number: ${response.data.data.applicationNumber}`);
        // Reset form or redirect to application status page
        form.reset();
        setCurrentStep(1);
      } else {
        toast.error(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Admission submission error:', error);
      const apiError = error as { response?: { data?: { errors?: string[] } } };
      if (apiError.response?.data?.errors) {
        apiError.response.data.errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            currentStep >= step
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-500 border-gray-300'
          }`}>
            {step}
          </div>
          <span className={`mt-2 text-sm ${
            currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'
          }`}>
            {step === 1 && 'Personal Info'}
            {step === 2 && 'Academic Info'}
            {step === 3 && 'Parent Info'}
            {step === 4 && 'Review & Submit'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">College Admission Application</h1>
          <p className="text-gray-600">Fill out all sections carefully to complete your application</p>
        </div>

        {renderStepIndicator()}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Please provide your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender *</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalInfo.category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">Select Category</option>
                              <option value="General">General</option>
                              <option value="OBC">OBC</option>
                              <option value="SC">SC</option>
                              <option value="ST">ST</option>
                              <option value="EWS">EWS</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Permanent Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="personalInfo.address.permanent.street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address *</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter complete address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="personalInfo.address.permanent.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personalInfo.address.permanent.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personalInfo.address.permanent.pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter 6-digit pincode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <FormField
                        control={form.control}
                        name="personalInfo.address.correspondence.sameAsPermanent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Correspondence address same as permanent address</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {!watchSameAddress && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Correspondence Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name="personalInfo.address.correspondence.street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address *</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Enter complete address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="personalInfo.address.correspondence.city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter city" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="personalInfo.address.correspondence.state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter state" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="personalInfo.address.correspondence.pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter 6-digit pincode" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Academic Information */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                  <CardDescription>Provide your educational background and course preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="academicInfo.appliedCourse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Applied Course *</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">Select Course</option>
                              {Object.keys(coursesAndBranches).map(course => (
                                <option key={course} value={course}>{course}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="academicInfo.appliedBranch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Applied Branch *</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                              disabled={!watchAppliedCourse}
                            >
                              <option value="">Select Branch</option>
                              {coursesAndBranches[watchAppliedCourse]?.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Previous Education</h3>
                    <div className="space-y-4">
                      {form.watch('academicInfo.previousEducation').map((_, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`academicInfo.previousEducation.${index}.level`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Level *</FormLabel>
                                  <FormControl>
                                    <select
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      {...field}
                                    >
                                      <option value="">Select Level</option>
                                      <option value="10th">10th</option>
                                      <option value="12th">12th</option>
                                      <option value="Diploma">Diploma</option>
                                      <option value="Bachelor">Bachelor</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`academicInfo.previousEducation.${index}.board`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Board/University *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter board/university" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`academicInfo.previousEducation.${index}.school`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>School/Institution *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter school/institution name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`academicInfo.previousEducation.${index}.year`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Passing Year *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1990"
                                      max={new Date().getFullYear()}
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`academicInfo.previousEducation.${index}.percentage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Percentage *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Parent Information */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Parent/Guardian Information</CardTitle>
                  <CardDescription>Provide details of your parents/guardians</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Father&apos;s Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parentInfo.father.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Father&apos;s Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter father&apos;s name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentInfo.father.occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter father&apos;s occupation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentInfo.father.income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Annual Income (₹) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Enter annual income"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentInfo.father.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Mother&apos;s Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parentInfo.mother.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mother&apos;s Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter mother&apos;s name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentInfo.mother.occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter mother&apos;s occupation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentInfo.mother.income"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Annual Income (₹) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Enter annual income"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parentInfo.mother.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Submit Application</CardTitle>
                  <CardDescription>Please review all information before submitting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">₹{form.watch('feeInfo.admissionFee')}</div>
                        <div className="text-sm text-blue-800">Admission Fee</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">₹{form.watch('feeInfo.processingFee')}</div>
                        <div className="text-sm text-green-800">Processing Fee</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">₹{form.watch('feeInfo.totalFee')}</div>
                        <div className="text-sm text-purple-800">Total Fee</div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Ensure all information is accurate before submitting</li>
                        <li>• Processing fees are non-refundable</li>
                        <li>• You will receive a confirmation email with application number</li>
                        <li>• Application status can be tracked using the application number</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="space-x-2">
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}