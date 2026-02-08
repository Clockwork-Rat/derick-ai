import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import TargetsChart from '../TargetsChart'

describe('TargetsChart ordering', () => {
  it('orders wants with Other last', () => {
    render(
      <TargetsChart
        targets={{ Entertainment: 200, Other: 100, Housing: 500 }}
        projectedIncome={1000}
        categories={['Other', 'Entertainment', 'Housing']}
        needsCategories={['Housing']}
        wantsCategories={['Entertainment', 'Other']}
        savingsCategories={[]}
      />
    )

    const labels = screen.getAllByText(/Housing|Entertainment|Other|Saved/).map((el) => el.textContent)
    expect(labels).toEqual(['Housing', 'Entertainment', 'Other', 'Saved'])
  })
})
