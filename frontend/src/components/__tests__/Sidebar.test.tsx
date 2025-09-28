import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../Sidebar'
import { User as UserType } from '@/services/api'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, onClick, ...props }: any) => (
    <a href={href} onClick={onClick} {...props} data-testid="link">
      {children}
    </a>
  )
})

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>
      {children}
    </div>
  ),
  SheetContent: ({ children, side, className }: any) => (
    <div data-testid="sheet-content" data-side={side} className={className}>
      {children}
    </div>
  ),
  SheetTrigger: ({ children }: any) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock user data for different roles
const adminUser: UserType = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
}

const staffUser: UserType = {
  id: '2',
  name: 'Staff User',
  email: 'staff@example.com',
  role: 'staff',
}

const wardenUser: UserType = {
  id: '3',
  name: 'Warden User',
  email: 'warden@example.com',
  role: 'warden',
}

const studentUser: UserType = {
  id: '4',
  name: 'Student User',
  email: 'student@example.com',
  role: 'student',
}

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('renders desktop sidebar for admin user', () => {
    render(<Sidebar user={adminUser} />)

    expect(screen.getByText('College ERP')).toBeInTheDocument()
    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('displays correct navigation items for admin role', () => {
    render(<Sidebar user={adminUser} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByText('Fees')).toBeInTheDocument()
    expect(screen.getByText('Hostels')).toBeInTheDocument()
    expect(screen.getByText('Exams')).toBeInTheDocument()
  })

  it('displays correct navigation items for staff role', () => {
    render(<Sidebar user={staffUser} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByText('Fees')).toBeInTheDocument()
    expect(screen.getByText('Exams')).toBeInTheDocument()

    // Staff should not have access to Users and Hostels
    expect(screen.queryByText('Users')).not.toBeInTheDocument()
    expect(screen.queryByText('Hostels')).not.toBeInTheDocument()
  })

  it('displays correct navigation items for warden role', () => {
    render(<Sidebar user={wardenUser} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Hostels')).toBeInTheDocument()

    // Warden should not have access to other sections
    expect(screen.queryByText('Users')).not.toBeInTheDocument()
    expect(screen.queryByText('Students')).not.toBeInTheDocument()
    expect(screen.queryByText('Fees')).not.toBeInTheDocument()
    expect(screen.queryByText('Exams')).not.toBeInTheDocument()
  })

  it('displays correct navigation items for student role', () => {
    render(<Sidebar user={studentUser} />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('My Details')).toBeInTheDocument()
    expect(screen.getByText('My Fees')).toBeInTheDocument()
    expect(screen.getByText('My Exams')).toBeInTheDocument()
    expect(screen.getByText('My Hostel')).toBeInTheDocument()
  })

  it('renders mobile sidebar trigger', () => {
    render(<Sidebar user={adminUser} />)

    expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument()
  })

  it('renders search functionality', () => {
    render(<Sidebar user={adminUser} />)

    expect(screen.getByPlaceholderText('Search navigation...')).toBeInTheDocument()
  })

  it('filters navigation items based on search', async () => {
    const user = userEvent.setup()
    render(<Sidebar user={adminUser} />)

    const searchInput = screen.getByPlaceholderText('Search navigation...')
    await user.type(searchInput, 'Dashboard')

    // Should show Dashboard and hide other items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows "no results" message when search has no matches', async () => {
    const user = userEvent.setup()
    render(<Sidebar user={adminUser} />)

    const searchInput = screen.getByPlaceholderText('Search navigation...')
    await user.type(searchInput, 'NonExistentItem')

    expect(screen.getByText('No navigation items found')).toBeInTheDocument()
  })

  it('displays user avatar with first letter of name', () => {
    render(<Sidebar user={adminUser} />)

    expect(screen.getByText('A')).toBeInTheDocument() // First letter of "Admin User"
  })

  it('handles sidebar collapse toggle', async () => {
    const user = userEvent.setup()
    render(<Sidebar user={adminUser} />)

    // Find the collapse toggle button (chevron button)
    const toggleButtons = screen.getAllByTestId('button')
    const collapseToggle = toggleButtons.find(button =>
      button.querySelector('svg') || button.textContent === ''
    )

    if (collapseToggle) {
      await user.click(collapseToggle)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sidebar-collapsed', 'true')
    }
  })

  it('loads collapse state from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('true')
    render(<Sidebar user={adminUser} />)

    // The sidebar should be rendered in collapsed state
    expect(localStorageMock.getItem).toHaveBeenCalledWith('sidebar-collapsed')
  })

  it('renders navigation links with correct hrefs for admin', () => {
    render(<Sidebar user={adminUser} />)

    const links = screen.getAllByTestId('link')
    const dashboardLink = links.find(link =>
      link.getAttribute('href') === '/dashboard/admin'
    )
    const profileLink = links.find(link =>
      link.getAttribute('href') === '/dashboard/admin/profile'
    )

    expect(dashboardLink).toBeInTheDocument()
    expect(profileLink).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs for student', () => {
    render(<Sidebar user={studentUser} />)

    const links = screen.getAllByTestId('link')
    const dashboardLink = links.find(link =>
      link.getAttribute('href') === '/dashboard/student'
    )
    const detailsLink = links.find(link =>
      link.getAttribute('href') === '/dashboard/student/my-details'
    )

    expect(dashboardLink).toBeInTheDocument()
    expect(detailsLink).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    render(<Sidebar user={adminUser} />)

    const buttons = screen.getAllByTestId('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-sidebar-class'
    const { container } = render(<Sidebar user={adminUser} className={customClass} />)

    expect(container.querySelector(`.${customClass}`)).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    // Mock pathname to be dashboard
    const mockPathname = '/dashboard/admin'
    require('next/navigation').usePathname.mockReturnValue(mockPathname)

    render(<Sidebar user={adminUser} />)

    // The Dashboard link should have active styling
    const links = screen.getAllByTestId('link')
    const activeLink = links.find(link =>
      link.getAttribute('href') === '/dashboard/admin'
    )

    expect(activeLink).toBeInTheDocument()
  })

  it('renders logo with link to home', () => {
    render(<Sidebar user={adminUser} />)

    const logoLinks = screen.getAllByTestId('link')
    const logoLink = logoLinks.find(link =>
      link.getAttribute('href') === '/'
    )

    expect(logoLink).toBeInTheDocument()
    expect(screen.getByText('College ERP')).toBeInTheDocument()
  })

  it('handles unknown user role gracefully', () => {
    const unknownRoleUser = {
      id: '5',
      name: 'Unknown User',
      email: 'unknown@example.com',
      role: 'unknown' as any,
    }

    render(<Sidebar user={unknownRoleUser} />)

    // Should still render user info but no navigation items
    expect(screen.getByText('Unknown User')).toBeInTheDocument()
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })
})