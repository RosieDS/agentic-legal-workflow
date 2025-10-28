/**
 * Key Clauses Detail Data
 * 
 * Provides detailed bullet points for each key clause type.
 * These are the AI's plan for what will be included in each clause,
 * editable by the user in the "Customise in detail" view.
 */

export interface ClauseDetail {
  name: string
  bulletPoints: string[]
}

/**
 * Get detailed bullet points for key clauses based on document type
 */
export function getKeyClausesDetailForDocumentType(documentType: string): ClauseDetail[] {
  const lowerType = documentType.toLowerCase()
  
  // Non-Disclosure Agreement (NDA)
  if (lowerType.includes('nda') || lowerType.includes('non-disclosure') || lowerType.includes('confidential')) {
    return [
      {
        name: 'Warranties',
        bulletPoints: [
          'Both parties confirm they have the authority to enter the agreement',
          'Both parties agree to the warranties'
        ]
      },
      {
        name: 'Definition of confidential information',
        bulletPoints: [
          'Define confidential information as written, oral or digital materials',
          'Shared before or during, but not after the defined period'
        ]
      },
      {
        name: 'Handling of Information',
        bulletPoints: [
          'Confidential information should be stored on encrypted cloud storage',
          'It should be destroyed after the agreement period'
        ]
      },
      {
        name: 'Indemnities',
        bulletPoints: [
          'Signing party agrees to pay £1million in damages if confidential information is breached or mishandled'
        ]
      }
    ]
  }
  
  // Employment Agreement
  if (lowerType.includes('employment') || lowerType.includes('hire') || lowerType.includes('employee')) {
    return [
      {
        name: 'Duties and responsibilities',
        bulletPoints: [
          'Employee will report to the Head of Department',
          'Core responsibilities include managing team operations and client relationships',
          'Expected to work standard business hours with flexibility as needed'
        ]
      },
      {
        name: 'Compensation and benefits',
        bulletPoints: [
          'Annual salary of £[amount] paid monthly',
          'Eligibility for annual bonus based on performance',
          'Health insurance, pension contributions, and 25 days annual leave'
        ]
      },
      {
        name: 'Intellectual property assignment',
        bulletPoints: [
          'All work created during employment belongs to the company',
          'Employee assigns all rights to inventions and creative works',
          'Company retains ownership of work product after employment ends'
        ]
      },
      {
        name: 'Termination provisions',
        bulletPoints: [
          'Either party may terminate with [X] weeks notice',
          'Immediate termination for gross misconduct',
          'Severance terms apply if terminated without cause'
        ]
      }
    ]
  }
  
  // Service Agreement / Contractor Agreement
  if (lowerType.includes('service') || lowerType.includes('contractor') || lowerType.includes('consulting')) {
    return [
      {
        name: 'Scope of services',
        bulletPoints: [
          'Provider will deliver [specific services] as outlined in Statement of Work',
          'Deliverables include [list key outputs]',
          'Services exclude maintenance and support unless separately agreed'
        ]
      },
      {
        name: 'Payment terms',
        bulletPoints: [
          'Fixed fee of £[amount] or hourly rate of £[amount]',
          'Invoices submitted monthly and payable within 30 days',
          'Reasonable expenses reimbursed with prior approval'
        ]
      },
      {
        name: 'Intellectual property rights',
        bulletPoints: [
          'Client owns all work product created under this agreement',
          'Provider retains rights to pre-existing materials and tools',
          'Provider grants license to use any incorporated third-party materials'
        ]
      },
      {
        name: 'Liability and indemnification',
        bulletPoints: [
          'Each party\'s liability capped at total fees paid',
          'Provider indemnifies client against third-party IP claims',
          'Client indemnifies provider for claims arising from client-provided materials'
        ]
      }
    ]
  }
  
  // Purchase Agreement / Sale Agreement
  if (lowerType.includes('purchase') || lowerType.includes('sale') || lowerType.includes('acquisition')) {
    return [
      {
        name: 'Purchase price and payment',
        bulletPoints: [
          'Total purchase price of £[amount]',
          'Deposit of [X]% due upon signing',
          'Balance payable upon delivery/completion'
        ]
      },
      {
        name: 'Warranties and representations',
        bulletPoints: [
          'Seller warrants full ownership and right to sell',
          'Items sold are free from defects and fit for purpose',
          'Seller has disclosed all material information affecting value'
        ]
      },
      {
        name: 'Delivery and risk transfer',
        bulletPoints: [
          'Delivery to occur by [date] at [location]',
          'Risk of loss transfers to buyer upon delivery',
          'Seller responsible for damage during transit'
        ]
      },
      {
        name: 'Remedies for breach',
        bulletPoints: [
          'Buyer may reject non-conforming goods and receive refund',
          'Seller may retain deposit if buyer breaches',
          'Either party may claim damages for material breach'
        ]
      }
    ]
  }
  
  // Lease Agreement
  if (lowerType.includes('lease') || lowerType.includes('rental') || lowerType.includes('tenancy')) {
    return [
      {
        name: 'Rent and payment terms',
        bulletPoints: [
          'Monthly rent of £[amount] due on first day of each month',
          'Payment by bank transfer to account [details]',
          'Late payment incurs £[amount] penalty after [X] days'
        ]
      },
      {
        name: 'Maintenance and repairs',
        bulletPoints: [
          'Landlord responsible for structural repairs and major systems',
          'Tenant responsible for minor repairs and general upkeep',
          'Emergency repairs require immediate notification to landlord'
        ]
      },
      {
        name: 'Use restrictions',
        bulletPoints: [
          'Property to be used for residential purposes only',
          'No alterations without landlord\'s written consent',
          'No subletting or assignment without permission'
        ]
      },
      {
        name: 'Termination and renewal',
        bulletPoints: [
          'Initial term of [X] months beginning [date]',
          'Requires [X] months notice for non-renewal',
          'Early termination permitted with [X] months notice and penalty'
        ]
      }
    ]
  }
  
  // Partnership Agreement
  if (lowerType.includes('partnership') || lowerType.includes('joint venture')) {
    return [
      {
        name: 'Profit and loss sharing',
        bulletPoints: [
          'Profits distributed [X]% to Partner A, [Y]% to Partner B',
          'Losses allocated in same proportion as profit sharing',
          'Distributions made quarterly after accounting period'
        ]
      },
      {
        name: 'Decision-making authority',
        bulletPoints: [
          'Major decisions require unanimous partner approval',
          'Day-to-day operations managed by designated managing partner',
          'Disputes resolved through mediation before arbitration'
        ]
      },
      {
        name: 'Capital contributions',
        bulletPoints: [
          'Initial contributions: Partner A £[amount], Partner B £[amount]',
          'Additional capital calls require [X]% partner approval',
          'Contributions earn [X]% preferred return before profit split'
        ]
      },
      {
        name: 'Exit and dissolution',
        bulletPoints: [
          'Partner may exit with [X] months notice',
          'Exiting partner\'s interest valued by independent appraiser',
          'Upon dissolution, assets distributed after settling liabilities'
        ]
      }
    ]
  }
  
  // Default clauses for unknown document types
  return [
    {
      name: 'Rights and obligations',
      bulletPoints: [
        'Each party\'s primary rights under this agreement',
        'Key obligations and performance requirements',
        'Timeline for fulfilling responsibilities'
      ]
    },
    {
      name: 'Payment terms',
      bulletPoints: [
        'Total amount payable and payment schedule',
        'Method of payment and currency',
        'Late payment penalties and interest'
      ]
    },
    {
      name: 'Liability provisions',
      bulletPoints: [
        'Liability capped at [amount or percentage]',
        'Exclusions for indirect and consequential damages',
        'Indemnification obligations for each party'
      ]
    },
    {
      name: 'Termination rights',
      bulletPoints: [
        'Notice period required for termination',
        'Grounds for immediate termination',
        'Effects of termination on ongoing obligations'
      ]
    }
  ]
}

