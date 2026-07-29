import type { ConditionId, RecommendationId } from './types'

/**
 * The approved-language library. This is the grounding source for drafting:
 * the generator retrieves from here, it never writes prose of its own. Admin
 * edits layer on top as overrides, keyed by the same refs.
 */

/** System descriptions, keyed by `componentId|type`. */
export const DESCRIPTIONS: Record<string, string> = {
  'roof|TPO':
    'Low-slope, single-ply thermoplastic polyolefin (TPO) membrane, mechanically fastened, with internal roof drains and metal edge trim.',
  'roof|Modified Bitumen':
    'Low-slope modified bitumen membrane with granular cap sheet; internal drains and metal edge.',
  'roof|Built-up (BUR)':
    'Low-slope, built-up roof (BUR) membrane with a foam coating and elastomeric finish; internal roof drains and metal parapet coping.',
  'roof|Shingle (asphalt)':
    'Steep-slope asphalt shingle roofing over underlayment, with aluminum drip edge and gutters.',
  'roof|Metal': 'Standing-seam metal roof panels with concealed fasteners; ridge and eave trim.',
  'roof|Tile': 'Steep-slope concrete tile roofing over underlayment; hip and ridge trim.',

  'paint|Acrylic / elastomeric':
    'Painted stucco exterior with an acrylic/elastomeric coating and sealant at joints and penetrations.',
  'paint|Latex':
    'Painted exterior finished with an exterior-grade latex coating; sealant at joints and penetrations.',
  'paint|Stucco coating':
    'Cementitious stucco coating system over the masonry substrate with sealant at control joints.',
  'paint|Sealant / waterproofing':
    'Elastomeric sealant and waterproofing at joints, penetrations, and envelope transitions.',

  'windows|Single-hung': 'Single-hung aluminum-framed windows with double glazing.',
  'windows|Double-hung': 'Double-hung aluminum-framed windows with double glazing.',
  'windows|Storefront / curtain wall':
    'Aluminum storefront / curtain-wall glazing system with double-glazed units.',
  'windows|Fixed': 'Fixed aluminum-framed windows with double glazing.',
  'windows|Casement': 'Casement aluminum-framed windows with double glazing.',
  'windows|Impact-rated':
    'Fixed and operable aluminum-framed, double-glazed windows, organized in horizontal ribbons; impact-rated units at lower floors.',

  'doors|Hollow metal': 'Hollow-metal service and stair doors with commercial hardware.',
  'doors|Wood': 'Solid-core wood doors with commercial hardware.',
  'doors|Aluminum / glass entry':
    'Aluminum-and-glass storefront entrance doors; hollow-metal service and stair doors; solid-core wood tenant-suite doors.',
  'doors|Fire-rated':
    'Fire-rated door assemblies at stairs and corridors with closers and panic hardware.',
  'doors|Overhead / roll-up': 'Overhead roll-up doors at service and loading areas.',

  'hvac|Split system': 'Split-system condensing units with interior air handlers; R-410A refrigerant.',
  'hvac|Packaged rooftop unit (RTU)':
    'Roof-mounted packaged units (RTUs) serving upper floors and split systems serving lower floors; R-410A refrigerant.',
  'hvac|Chiller': 'Central chilled-water plant with air handlers; R-410A refrigerant.',
  'hvac|Air handler': 'Air-handling units with hydronic coils serving the occupied floors.',
  'hvac|Mini-split': 'Ductless mini-split systems serving individual spaces; R-410A refrigerant.',

  'plumbing|Copper supply':
    'Copper domestic water supply piping with gas-fired water heaters serving the occupied floors.',
  'plumbing|CPVC supply': 'CPVC domestic water supply piping with electric water heaters.',
  'plumbing|Galvanized supply':
    'Original galvanized steel domestic water supply piping, partially replaced with copper.',
  'plumbing|Cast iron waste': 'Cast iron sanitary waste and vent piping original to construction.',
  'plumbing|PVC waste': 'PVC sanitary waste and vent piping.',

  'electrical|Main switchgear':
    'Main electrical service terminating at fused switchgear, with distribution to tenant panelboards.',
  'electrical|Panelboards':
    'Circuit-breaker panelboards serving house and tenant loads, fed from the main distribution section.',
  'electrical|Bus duct': 'Bus duct riser distributing power to panelboards on each floor.',
  'electrical|Transformer':
    'Pad-mounted utility transformer serving the main switchboard, with dry-type transformers for step-down distribution.',

  'pavement|Asphalt':
    'Asphalt-paved drive aisles and parking field with concrete curbing and painted striping.',
  'pavement|Concrete':
    'Concrete-paved drive aisles and parking field with integral curbing and painted striping.',
  'pavement|Paver': 'Interlocking concrete paver drive aisles with concrete curbing.',
  'pavement|Chip seal': 'Chip-seal surfaced drive aisles over an asphalt base with concrete curbing.',
}

/** Condition language, keyed by condition id. */
export const CONDITION_LANGUAGE: Record<ConditionId, string> = {
  good: 'No major signs of age or wear observed; the system is near the start of its expected service life.',
  fair: 'Serviceable and functional, showing age and wear consistent with its service life; will require attention during the term.',
  poor: 'Notable deterioration observed; corrective work is required immediately or within approximately 12 months.',
  failed: 'Not serviceable; the system has reached the end of its useful life.',
}

/** Recommendation language, keyed by recommendation id. */
export const RECOMMENDATION_LANGUAGE: Record<RecommendationId, string> = {
  none: 'No immediate or short-term repairs required. No cost carried.',
  routine:
    'No immediate or short-term repairs required; observed wear may be addressed as part of routine maintenance. No cost carried.',
  monitor:
    'Monitor the condition and address findings as part of routine maintenance. No cost carried at this time.',
  repair:
    'Repair of the deficient areas is recommended within the short term to protect the building envelope and systems. Cost carried to the Short-Term Costs table.',
  'repair-now':
    'Immediate repair of the deficient areas is recommended. Cost carried to the Immediate Needs table.',
  'replace-5':
    'Replacement is recommended within approximately five years, before the end of the current hold period. Cost carried to the Capital Plan table.',
  'replace-now':
    'Based on the observed conditions and the expected useful life of the system, replacement is recommended immediately. Cost carried to the Immediate Needs table.',
  'plan-5-10':
    'Plan for replacement within five to ten years as the system approaches the end of its expected useful life. Cost carried to the Capital Plan table.',
}

/** Boilerplate that appears in every report. */
export const REPORT_BOILERPLATE = {
  scope1:
    'Sense Engineering was retained to conduct a Property Condition Assessment of the subject property and to provide an objective, independent opinion of the property’s physical condition and of probable costs to remedy observed deficiencies. The assessment was conducted in general accordance with ASTM E2018.',
  scope2:
    'The assessment included a walk-through survey of representative, accessible areas of the property; a review of readily available documents; and an interview with property management. No destructive testing, calculations, or investigation of concealed conditions was performed. Observed components were rated on the following scale:',
  scope3:
    'Repair or replacement items totaling less than $1,000 are considered routine maintenance and are not itemized unless they represent a safety or code concern.',
  ratings: [
    { k: 'Excellent', v: 'new or like new.' },
    { k: 'Good', v: 'no major signs of age or wear; may need replacement later in the term.' },
    { k: 'Fair', v: 'serviceable, showing age and wear; will require attention during the term.' },
    { k: 'Poor', v: 'requires action immediately or within approximately 12 months.' },
  ],
  reservesNote:
    'Costs are placed in the year a component reaches the end of its expected useful life (EUL), based on current condition and age. Figures are uninflated; an inflation factor is typically applied in the final report.',
}
