/**
 * Key Clauses Data
 * 
 * Defines the top 4 key clauses for different document types.
 * Excludes generic clauses (like Purpose) and standard boilerplate.
 */

export interface KeyClause {
  name: string
  explanation: string
}

/**
 * Get the top 4 key clauses for a given document type
 */
export function getKeyClausesForDocumentType(documentType: string): KeyClause[] {
  const lowerType = documentType.toLowerCase()
  
  // Non-Disclosure Agreement (NDA)
  if (lowerType.includes('nda') || lowerType.includes('non-disclosure') || lowerType.includes('confidential')) {
    return [
      {
        name: 'Warranties',
        explanation: 'Ensures both parties confirm they have the authority to enter the agreement and that the information shared is accurate'
      },
      {
        name: 'Non-disclosure obligations',
        explanation: 'Sets out the receiving party\'s duty to keep confidential information secret and not share it with third parties'
      },
      {
        name: 'Handling of information',
        explanation: 'Defines how confidential information should be stored, accessed, and eventually returned or destroyed'
      },
      {
        name: 'Indemnities',
        explanation: 'Protects the disclosing party by ensuring compensation if confidential information is misused or disclosed'
      }
    ]
  }
  
  // Employment Agreement
  if (lowerType.includes('employment') || lowerType.includes('hire') || lowerType.includes('employee')) {
    return [
      {
        name: 'Duties and responsibilities',
        explanation: 'Clearly defines the role, reporting structure, and key responsibilities expected of the employee'
      },
      {
        name: 'Compensation and benefits',
        explanation: 'Specifies salary, bonuses, equity, health benefits, and other forms of remuneration the employee will receive'
      },
      {
        name: 'Intellectual property assignment',
        explanation: 'Ensures any work created by the employee during their employment belongs to the company'
      },
      {
        name: 'Termination provisions',
        explanation: 'Sets out notice periods, severance terms, and conditions under which either party can end the employment'
      }
    ]
  }
  
  // Service Agreement / Contractor Agreement
  if (lowerType.includes('service') || lowerType.includes('contractor') || lowerType.includes('consulting')) {
    return [
      {
        name: 'Scope of services',
        explanation: 'Defines exactly what services will be provided, deliverables expected, and any limitations on the work'
      },
      {
        name: 'Payment terms',
        explanation: 'Specifies fees, payment schedule, invoicing requirements, and any expenses that will be reimbursed'
      },
      {
        name: 'Intellectual property rights',
        explanation: 'Clarifies who owns the work product and any pre-existing intellectual property used in the services'
      },
      {
        name: 'Liability and indemnification',
        explanation: 'Limits each party\'s liability and sets out when one party must compensate the other for losses or claims'
      }
    ]
  }
  
  // Purchase Agreement / Sale Agreement
  if (lowerType.includes('purchase') || lowerType.includes('sale') || lowerType.includes('acquisition')) {
    return [
      {
        name: 'Purchase price and payment',
        explanation: 'Sets the total price, payment method, deposit requirements, and timeline for completing payment'
      },
      {
        name: 'Warranties and representations',
        explanation: 'Seller confirms the condition, ownership, and legal status of what is being sold'
      },
      {
        name: 'Delivery and risk transfer',
        explanation: 'Defines when and how delivery occurs and when risk of loss transfers from seller to buyer'
      },
      {
        name: 'Remedies for breach',
        explanation: 'Outlines what happens if either party fails to meet their obligations, including potential damages'
      }
    ]
  }
  
  // Lease Agreement
  if (lowerType.includes('lease') || lowerType.includes('rental') || lowerType.includes('tenancy')) {
    return [
      {
        name: 'Rent and payment terms',
        explanation: 'Specifies the rental amount, payment schedule, acceptable payment methods, and late payment penalties'
      },
      {
        name: 'Maintenance and repairs',
        explanation: 'Clarifies which party is responsible for maintaining the property and handling repairs'
      },
      {
        name: 'Use restrictions',
        explanation: 'Defines how the tenant can use the property and any prohibited activities or alterations'
      },
      {
        name: 'Termination and renewal',
        explanation: 'Sets out the lease term, notice requirements for ending or renewing, and conditions for early termination'
      }
    ]
  }
  
  // Partnership Agreement
  if (lowerType.includes('partnership') || lowerType.includes('joint venture')) {
    return [
      {
        name: 'Profit and loss sharing',
        explanation: 'Defines how profits, losses, and distributions will be allocated among partners'
      },
      {
        name: 'Decision-making authority',
        explanation: 'Sets out which decisions require unanimous consent and which can be made by individual partners'
      },
      {
        name: 'Capital contributions',
        explanation: 'Specifies what each partner must contribute initially and procedures for additional capital calls'
      },
      {
        name: 'Exit and dissolution',
        explanation: 'Outlines how a partner can exit the partnership and how assets will be divided if the partnership dissolves'
      }
    ]
  }
  
  // Default clauses for unknown document types
  return [
    {
      name: 'Rights and obligations',
      explanation: 'Defines the key rights and responsibilities of each party under this agreement'
    },
    {
      name: 'Payment terms',
      explanation: 'Sets out the financial arrangements, including amounts, timing, and method of payment'
    },
    {
      name: 'Liability provisions',
      explanation: 'Limits each party\'s liability and clarifies when compensation must be provided for losses'
    },
    {
      name: 'Termination rights',
      explanation: 'Specifies the conditions under which either party can end the agreement and the consequences'
    }
  ]
}

