import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import YearInReview from '../YearInReview'

describe('YearInReview', () => {
  it('renders Year Breakdown header and years dropdown', () => {
    const onYearChange = vi.fn()
    render(
      <YearInReview
        transactions={[]}
        year={2024}
        years={[2024, 2023]}
        onYearChange={onYearChange}
      />
    )

    expect(screen.getByText('Year Breakdown')).toBeInTheDocument()
    const select = screen.getByRole('combobox')
    expect(select.value).toBe('2024')

    fireEvent.change(select, { target: { value: '2023' } })
    expect(onYearChange).toHaveBeenCalledWith(2023)
  })
})
