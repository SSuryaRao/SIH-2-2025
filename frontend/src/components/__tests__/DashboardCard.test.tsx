import React from 'react'
import { render, screen } from '@testing-library/react'
import { Users, TrendingUp, TrendingDown } from 'lucide-react'
import DashboardCard from '../DashboardCard'

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

describe('DashboardCard', () => {
  const defaultProps = {
    title: 'Total Students',
    value: '1,234',
  }

  it('renders with required props', () => {
    render(<DashboardCard {...defaultProps} />)

    expect(screen.getByText('Total Students')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('renders with numeric value', () => {
    render(<DashboardCard title="Test Title" value={42} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders with description when provided', () => {
    const description = 'Active students this semester'
    render(
      <DashboardCard
        {...defaultProps}
        description={description}
      />
    )

    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('renders with icon when provided', () => {
    render(
      <DashboardCard
        {...defaultProps}
        icon={Users}
        data-testid="dashboard-card"
      />
    )

    // Check if the icon is rendered by looking for its role or container
    const iconContainer = screen.getByRole('button', { hidden: true }) ||
                         document.querySelector('[data-testid="dashboard-card"] svg')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders positive trend correctly', () => {
    const trend = { value: 15, isPositive: true }
    render(
      <DashboardCard
        {...defaultProps}
        trend={trend}
      />
    )

    expect(screen.getByText('+15%')).toBeInTheDocument()
    expect(screen.getByText('from last month')).toBeInTheDocument()

    // Check for trending up icon (it should be in the document)
    const trendContainer = screen.getByText('+15%').closest('div')
    expect(trendContainer).toHaveClass('bg-green-100')
  })

  it('renders negative trend correctly', () => {
    const trend = { value: 8, isPositive: false }
    render(
      <DashboardCard
        {...defaultProps}
        trend={trend}
      />
    )

    expect(screen.getByText('8%')).toBeInTheDocument()
    expect(screen.getByText('from last month')).toBeInTheDocument()

    // Check for negative trend styling
    const trendContainer = screen.getByText('8%').closest('div')
    expect(trendContainer).toHaveClass('bg-red-100')
  })

  it('applies gradient styling when gradient prop is true', () => {
    const { container } = render(
      <DashboardCard
        {...defaultProps}
        gradient={true}
      />
    )

    // Check for gradient classes in the card
    const card = container.querySelector('[class*="bg-gradient"]')
    expect(card).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class'
    const { container } = render(
      <DashboardCard
        {...defaultProps}
        className={customClass}
      />
    )

    const card = container.firstChild
    expect(card).toHaveClass(customClass)
  })

  it('renders all elements together', () => {
    const fullProps = {
      title: 'Total Revenue',
      value: '$45,678',
      description: 'Revenue generated this month',
      icon: Users,
      trend: { value: 12, isPositive: true },
      gradient: true,
      className: 'custom-card',
    }

    render(<DashboardCard {...fullProps} />)

    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('$45,678')).toBeInTheDocument()
    expect(screen.getByText('Revenue generated this month')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
    expect(screen.getByText('from last month')).toBeInTheDocument()
  })

  it('handles zero trend value', () => {
    const trend = { value: 0, isPositive: true }
    render(
      <DashboardCard
        {...defaultProps}
        trend={trend}
      />
    )

    expect(screen.getByText('+0%')).toBeInTheDocument()
  })

  it('handles large numbers correctly', () => {
    render(
      <DashboardCard
        title="Large Number"
        value={1000000}
      />
    )

    expect(screen.getByText('1000000')).toBeInTheDocument()
  })

  it('renders without trend when not provided', () => {
    render(<DashboardCard {...defaultProps} />)

    expect(screen.queryByText('from last month')).not.toBeInTheDocument()
  })

  it('renders without description when not provided', () => {
    render(<DashboardCard {...defaultProps} />)

    // Should only have title and value, no description
    expect(screen.getByText('Total Students')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.queryByText(/Active students/)).not.toBeInTheDocument()
  })

  it('handles string values with special characters', () => {
    render(
      <DashboardCard
        title="Special Value"
        value="$1,234.56"
      />
    )

    expect(screen.getByText('$1,234.56')).toBeInTheDocument()
  })
})