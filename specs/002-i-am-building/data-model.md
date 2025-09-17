# Data Model: Historic Equity Lead-Generation WordPress Theme

## Core Entities

### Contact Lead
**Purpose**: Capture and qualify potential client inquiries

**Fields**:
- `name` (string, required): Contact person name
- `email` (string, required, validated): Contact email address
- `phone` (string, optional): Contact phone number
- `company` (string, optional): Organization/company name
- `project_location` (string, required): Property address or city/state
- `property_type` (enum, required): Historic building type
  - Values: "Commercial", "Residential", "Industrial", "Institutional", "Mixed-Use"
- `project_timeline` (enum, required): Expected project start
  - Values: "0-6 months", "6-12 months", "1-2 years", "2+ years", "Planning phase"
- `estimated_budget` (enum, optional): Project investment range
  - Values: "$100K-$500K", "$500K-$1M", "$1M-$5M", "$5M+", "Not sure"
- `project_description` (text, required): Brief project description
- `referral_source` (enum, optional): How they found Historic Equity
  - Values: "Google Search", "Referral", "Event", "Social Media", "Other"
- `consent_marketing` (boolean, default: false): Marketing communications consent
- `submission_date` (datetime, auto): Form submission timestamp
- `lead_status` (enum, default: "new"): Lead qualification status
  - Values: "new", "qualified", "contacted", "proposal", "closed-won", "closed-lost"

**Validation Rules**:
- Email must be valid format
- Project location must not be empty
- Project description minimum 20 characters
- Phone number format validation (if provided)

**Relationships**:
- No direct relationships (standalone entity)

### Project Showcase
**Purpose**: Display successful Historic Equity investments for credibility

**Fields**:
- `title` (string, required): Project name/title
- `location` (string, required): City, State format
- `state` (string, required): Two-letter state code for filtering
- `property_type` (enum, required): Building classification
  - Values: "Commercial", "Residential", "Industrial", "Institutional", "Mixed-Use"
- `year_completed` (integer, required): Project completion year
- `investment_amount` (string, optional): Investment range (e.g., "$2.5M - $5M")
- `tax_credits_generated` (string, optional): SHTC value (e.g., "$1.2M in credits")
- `description` (text, required): Project description and outcomes
- `featured_image` (media, required): Primary project image
- `gallery_images` (media_array, optional): Additional project photos
- `client_testimonial` (text, optional): Client quote about experience
- `client_name` (string, optional): Client name for testimonial
- `project_highlights` (array, optional): Key project benefits/outcomes
- `featured` (boolean, default: false): Show on homepage
- `published` (boolean, default: true): Display on site
- `seo_title` (string, optional): Custom page title
- `seo_description` (string, optional): Meta description

**Validation Rules**:
- Year completed must be between 2001 and current year
- State code must be valid US state
- Description minimum 50 characters
- Featured image is required
- Investment amounts follow currency format

**Relationships**:
- Grouped by state for state-specific pages
- Tagged by property type for filtering

### Service Information
**Purpose**: Structured content for SHTC investment process education

**Fields**:
- `service_name` (string, required): Service title
- `service_type` (enum, required): Category of service
  - Values: "Investment Process", "Qualification Criteria", "Benefits", "Timeline", "Documentation"
- `description` (text, required): Detailed service explanation
- `key_benefits` (array, required): Bullet points of main benefits
- `eligibility_requirements` (array, optional): Qualification criteria
- `typical_timeline` (string, optional): Process duration
- `required_documentation` (array, optional): Needed documents
- `service_icon` (media, optional): Visual representation
- `call_to_action` (string, optional): Service-specific CTA text
- `display_order` (integer, default: 0): Sort order on pages
- `featured_on_homepage` (boolean, default: false): Homepage display

**Validation Rules**:
- Service name must be unique
- Description minimum 100 characters
- Key benefits must have at least 2 items
- Display order must be positive integer

**Relationships**:
- Services grouped by type for section organization
- Related to contact forms via specific CTAs

### State Coverage
**Purpose**: State-specific information and project examples

**Fields**:
- `state_name` (string, required): Full state name
- `state_code` (string, required, unique): Two-letter state abbreviation
- `coverage_since` (integer, required): Year Historic Equity started in state
- `projects_completed` (integer, default: 0): Number of completed projects
- `total_investment` (string, optional): Cumulative investment amount
- `state_specific_info` (text, required): State SHTC program details
- `key_regulations` (array, optional): Important state-specific rules
- `typical_credit_percentage` (string, optional): Standard credit rate
- `application_process` (text, optional): State-specific application info
- `contact_preference` (string, optional): Preferred contact method for state
- `featured_projects` (array, optional): IDs of showcase projects in state
- `state_resources` (array, optional): Links to state SHTC resources
- `active` (boolean, default: true): Currently serving this state

**Validation Rules**:
- State code must be unique and valid US state
- Coverage since must be >= 2001
- Projects completed must be non-negative
- State specific info minimum 200 characters

**Relationships**:
- One-to-many with Project Showcase (via state_code)
- Used for contact form lead qualification

### Company Profile
**Purpose**: Historic Equity company and team information

**Fields**:
- `company_name` (string, required): "Historic Equity Inc."
- `founded_year` (integer, required): 2001
- `headquarters` (string, required): "St. Louis, MO"
- `mission_statement` (text, required): Company mission
- `value_proposition` (text, required): Key differentiators
- `company_history` (text, required): Background and growth story
- `total_projects` (integer, required): Portfolio project count
- `total_investment` (string, required): Cumulative investment amount
- `states_served` (integer, required): Number of states covered
- `team_size` (integer, optional): Employee count
- `certifications` (array, optional): Industry certifications/memberships
- `awards` (array, optional): Company recognition
- `press_mentions` (array, optional): Media coverage

**Validation Rules**:
- Founded year must be 2001
- Headquarters must include city and state
- Mission statement minimum 100 characters
- Total projects must be positive integer

**Relationships**:
- Single instance (company information)
- Referenced across all pages for consistency

## State Transitions

### Contact Lead Status Flow
```
new → qualified → contacted → proposal → closed-won
  ↓      ↓          ↓          ↓
  ↓      ↓          ↓      closed-lost
  ↓      ↓      closed-lost
  ↓  closed-lost
  ↓
closed-lost
```

### Project Showcase Publication Flow
```
draft → review → published
  ↓       ↓
  ↓   unpublished
  ↓
unpublished
```

## WordPress Implementation Notes

### Custom Post Types
- `project_showcase` - Project portfolio items
- `service_info` - Service descriptions
- `state_coverage` - State-specific information

### Custom Fields (ACF/Meta Fields)
- All entity fields implemented as WordPress meta fields
- Validation handled via WordPress hooks and custom validation functions

### Taxonomies
- `property_type` - Shared taxonomy for projects and leads
- `service_type` - Category taxonomy for services
- `state_region` - Grouping states by geographic regions

### Database Considerations
- All data stored in WordPress database (wp_posts, wp_postmeta)
- Contact leads stored in custom table for better lead management
- Image optimization for project galleries
- Caching strategy for state-specific queries