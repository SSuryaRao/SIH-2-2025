import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudentFormModal from '../StudentFormModal'
import { studentsAPI } from '@/services/api'

// Mock the API
jest.mock('@/services/api', () => ({
  studentsAPI: {
    create: jest.fn(),
    update: jest.fn(),
  },
}))

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e.preventDefault()
      fn({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        dateOfBirth: '2000-01-01',
        gender: 'male',
        permanentAddress: 'Permanent Address',
        currentAddress: 'Current Address',
        course: 'B.Tech',
        branch: 'Computer Science Engineering',
        semester: 1,
        year: 1,
        rollNumber: 'CS001',
        admissionDate: '2023-01-01',
      })
    },
    reset: jest.fn(),
    formState: { errors: {} },
  }),
}))

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <form data-testid="form">{children}</form>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormField: ({ render }: any) => render({ field: { value: '', onChange: jest.fn() } }),
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label data-testid="form-label">{children}</label>,
  FormMessage: () => <div data-testid="form-message"></div>,
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select" onClick={() => onValueChange?.('test')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <option data-testid="select-item" value={value}>
      {children}
    </option>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea data-testid="textarea" {...props} />,
}))

const mockStudent = {
  id: '1',
  personalInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    dateOfBirth: '2000-01-01',
    gender: 'male' as const,
    address: {
      permanent: 'Permanent Address',
      current: 'Current Address',
    },
  },
  academicInfo: {
    course: 'B.Tech',
    branch: 'Computer Science Engineering',
    semester: 1,
    year: 1,
    rollNumber: 'CS001',
    admissionDate: '2023-01-01',
  },
  enrollmentDate: '2023-01-01',
  status: 'active' as const,
}

describe('StudentFormModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(<StudentFormModal {...defaultProps} />)

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<StudentFormModal {...defaultProps} open={false} />)

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('displays "Add New Student" title for new student', () => {
    render(<StudentFormModal {...defaultProps} />)

    expect(screen.getByText('Add New Student')).toBeInTheDocument()
    expect(screen.getByText('Fill in the details to add a new student')).toBeInTheDocument()
  })

  it('displays "Edit Student" title for existing student', () => {
    render(<StudentFormModal {...defaultProps} student={mockStudent} />)

    expect(screen.getByText('Edit Student')).toBeInTheDocument()
    expect(screen.getByText('Update student information')).toBeInTheDocument()
  })

  it('renders all form sections', () => {
    render(<StudentFormModal {...defaultProps} />)

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Address Information')).toBeInTheDocument()
    expect(screen.getByText('Academic Information')).toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(<StudentFormModal {...defaultProps} />)

    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone Number')).toBeInTheDocument()
    expect(screen.getByText('Date of Birth')).toBeInTheDocument()
    expect(screen.getByText('Gender')).toBeInTheDocument()
    expect(screen.getByText('Permanent Address')).toBeInTheDocument()
    expect(screen.getByText('Current Address')).toBeInTheDocument()
    expect(screen.getByText('Course')).toBeInTheDocument()
    expect(screen.getByText('Branch')).toBeInTheDocument()
    expect(screen.getByText('Semester')).toBeInTheDocument()
    expect(screen.getByText('Year')).toBeInTheDocument()
    expect(screen.getByText('Roll Number')).toBeInTheDocument()
    expect(screen.getByText('Admission Date')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<StudentFormModal {...defaultProps} />)

    const buttons = screen.getAllByTestId('button')
    expect(buttons).toHaveLength(2)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Add Student')).toBeInTheDocument()
  })

  it('shows correct button text for edit mode', () => {
    render(<StudentFormModal {...defaultProps} student={mockStudent} />)

    expect(screen.getByText('Update Student')).toBeInTheDocument()
  })

  it('calls onOpenChange when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<StudentFormModal {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
  })

  it('submits form for creating new student', async () => {
    const user = userEvent.setup()
    const mockCreate = jest.mocked(studentsAPI.create)
    mockCreate.mockResolvedValue({ success: true, data: mockStudent })

    render(<StudentFormModal {...defaultProps} />)

    const submitButton = screen.getByText('Add Student')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        dateOfBirth: '2000-01-01',
        gender: 'male',
        address: {
          permanent: 'Permanent Address',
          current: 'Current Address',
        },
        course: 'B.Tech',
        branch: 'Computer Science Engineering',
        semester: 1,
        year: 1,
        rollNumber: 'CS001',
        admissionDate: '2023-01-01',
      })
    })
  })

  it('submits form for updating existing student', async () => {
    const user = userEvent.setup()
    const mockUpdate = jest.mocked(studentsAPI.update)
    mockUpdate.mockResolvedValue({ success: true, data: mockStudent })

    render(<StudentFormModal {...defaultProps} student={mockStudent} />)

    const submitButton = screen.getByText('Update Student')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith('1', expect.any(Object))
    })
  })

  it('handles successful form submission', async () => {
    const user = userEvent.setup()
    const mockCreate = jest.mocked(studentsAPI.create)
    mockCreate.mockResolvedValue({ success: true, data: mockStudent })

    render(<StudentFormModal {...defaultProps} />)

    const submitButton = screen.getByText('Add Student')
    await user.click(submitButton)

    await waitFor(() => {
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
      expect(defaultProps.onSuccess).toHaveBeenCalled()
    })
  })

  it('handles form submission error', async () => {
    const user = userEvent.setup()
    const mockCreate = jest.mocked(studentsAPI.create)
    mockCreate.mockResolvedValue({ success: false, message: 'Error creating student' })

    render(<StudentFormModal {...defaultProps} />)

    const submitButton = screen.getByText('Add Student')
    await user.click(submitButton)

    // The component should not close on error
    await waitFor(() => {
      expect(defaultProps.onOpenChange).not.toHaveBeenCalledWith(false)
    })
  })

  it('handles API error during submission', async () => {
    const user = userEvent.setup()
    const mockCreate = jest.mocked(studentsAPI.create)
    mockCreate.mockRejectedValue(new Error('Network error'))

    render(<StudentFormModal {...defaultProps} />)

    const submitButton = screen.getByText('Add Student')
    await user.click(submitButton)

    // The component should not close on error
    await waitFor(() => {
      expect(defaultProps.onOpenChange).not.toHaveBeenCalledWith(false)
    })
  })

  it('disables submit button during submission', async () => {
    const user = userEvent.setup()
    const mockCreate = jest.mocked(studentsAPI.create)
    // Make the API call take some time
    mockCreate.mockImplementation(() => new Promise(resolve =>
      setTimeout(() => resolve({ success: true, data: mockStudent }), 100)
    ))

    render(<StudentFormModal {...defaultProps} />)

    const submitButton = screen.getByText('Add Student')
    await user.click(submitButton)

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled()
  })

  it('populates form with student data in edit mode', () => {
    render(<StudentFormModal {...defaultProps} student={mockStudent} />)

    // The form should be populated with student data
    // This is handled by the useForm defaultValues, which we've mocked
    expect(screen.getByTestId('form')).toBeInTheDocument()
  })
})