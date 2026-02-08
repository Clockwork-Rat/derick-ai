import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExpenditureChart from '../ExpenditureChart'

describe('ExpenditureChart ordering', () => {
  it('places Other last within wants and Saved at the bottom', () => {
    const data = [
      { label: 'Housing', amount: 100, percentage: 10 },
      { label: 'Other', amount: 20, percentage: 2 },
      { label: 'Entertainment', amount: 50, percentage: 5 },
      { label: 'Saved', amount: 30, percentage: 3 }
    ]

    render(
      <ExpenditureChart
        data={data}
        needsCategories={['Housing']}
        wantsCategories={['Entertainment', 'Other']}
        savingsCategories={[]}
      />
    )

    const labels = screen.getAllByText(/Housing|Entertainment|Other|Saved/).map((el) => el.textContent)
    expect(labels).toEqual(['Housing', 'Entertainment', 'Other', 'Saved'])
  })
})
